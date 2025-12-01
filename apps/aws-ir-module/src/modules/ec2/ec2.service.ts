import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import {
  GetMetricStatisticsCommand,
  Statistic,
  StandardUnit,
} from '@aws-sdk/client-cloudwatch';
import { InstanceDetails, IdleInstanceDetails } from '@libs/entities';
import { AwsService } from '../../lib/aws/aws.service';

@Injectable()
export class Ec2Service {
  constructor(
    @InjectRepository(InstanceDetails)
    private instanceDetailsRepository: Repository<InstanceDetails>,
    @InjectRepository(IdleInstanceDetails)
    private idleInstanceDetailsRepository: Repository<IdleInstanceDetails>,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  async detectIdleResources(): Promise<IdleInstanceDetails[]> {
    const ec2Client = this.awsService.getEC2Client();
    const cloudWatchClient = this.awsService.getCloudWatchClient();
    const idleResources: IdleInstanceDetails[] = [];

    try {
      const command = new DescribeInstancesCommand({});
      const response = await ec2Client.send(command);

      const stoppedThreshold = this.configService.get<number>(
        'EC2_STOPPED_DAYS_THRESHOLD',
        30,
      );
      const cpuThreshold = this.configService.get<number>(
        'EC2_CPU_THRESHOLD',
        5,
      );
      const now = new Date();

      const runningInstances: any[] = [];
      const stoppedInstances: any[] = [];

      for (const reservation of response.Reservations || []) {
        for (const instance of reservation.Instances || []) {
          if (!instance.InstanceId) continue;

          if (instance.State?.Name === 'running') {
            runningInstances.push(instance);
          } else if (instance.State?.Name === 'stopped') {
            stoppedInstances.push(instance);
          }
        }
      }

      for (const instance of stoppedInstances) {
        const instanceDetails = await this.saveInstanceDetails(instance);

        if (instance.LaunchTime) {
          const stoppedDays = Math.floor(
            (now.getTime() - instance.LaunchTime.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (stoppedDays > stoppedThreshold) {
            const idleResource = new IdleInstanceDetails();
            idleResource.InstanceId = instance.InstanceId;
            idleResource.InstanceName = this.getInstanceName(instance);
            idleResource.InstanceType = instance.InstanceType;
            idleResource.Region = this.awsService.getRegion();
            idleResource.InstanceStatus = instance.State?.Name;
            idleResource.AccountId = instanceDetails?.AccountId || null;
            idleResource.CurrencyCode = instanceDetails?.CurrencyCode || 'USD';
            idleResource.Unit = 'Percent';
            idleResource.IsActive = 1;
            idleResource.IsDisabled = 0;
            idleResource.IdleReason = 'STOPPED';
            idleResource.StoppedDays = stoppedDays;
            idleResource.CPUUtil = 0;
            idleResources.push(idleResource);
          }
        }
      }

      for (const instance of runningInstances) {
        const instanceDetails = await this.saveInstanceDetails(instance);

        const avgCpu = await this.getAverageCpuUtilization(
          cloudWatchClient,
          instance.InstanceId,
        );

        if (instanceDetails && avgCpu !== null) {
          instanceDetails.InstanceAverageUsage = avgCpu;
          instanceDetails.InstancePeakCPU = avgCpu;
          await this.instanceDetailsRepository.save(instanceDetails);
        }

        if (avgCpu !== null && avgCpu < cpuThreshold) {
          const idleResource = new IdleInstanceDetails();
          idleResource.InstanceId = instance.InstanceId;
          idleResource.InstanceName = this.getInstanceName(instance);
          idleResource.InstanceType = instance.InstanceType;
          idleResource.Region = this.awsService.getRegion();
          idleResource.InstanceStatus = instance.State?.Name;
          idleResource.AccountId = instanceDetails?.AccountId || null;
          idleResource.CurrencyCode = instanceDetails?.CurrencyCode || 'USD';
          idleResource.Unit = 'Percent';
          idleResource.IsActive = 1;
          idleResource.IsDisabled = 0;
          idleResource.IdleReason = 'LOW_CPU';
          idleResource.CPUUtil = avgCpu;
          idleResource.StoppedDays = 0;
          idleResources.push(idleResource);
        }
      }

      if (idleResources.length > 0) {
        await this.idleInstanceDetailsRepository.save(idleResources);
      }

      return idleResources;
    } catch (error) {
      console.error('Error detecting EC2 idle resources:', error);
      throw error;
    }
  }

  private async getAverageCpuUtilization(
    cloudWatchClient: any,
    instanceId: string,
    periodInDays: number = 30,
  ): Promise<number | null> {
    try {
      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - periodInDays);

      const command = new GetMetricStatisticsCommand({
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [
          {
            Name: 'InstanceId',
            Value: instanceId,
          },
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: [Statistic.Average],
        Unit: StandardUnit.Percent,
      });

      const response = await cloudWatchClient.send(command);

      if (!response.Datapoints || response.Datapoints.length === 0) {
        console.warn(`No CPU metrics found for instance ${instanceId}`);
        return null;
      }

      const sum = response.Datapoints.reduce(
        (acc: number, point: any) => acc + (point.Average || 0),
        0,
      );
      const average = sum / response.Datapoints.length;

      return Math.round(average * 100) / 100;
    } catch (error) {
      console.error(`Error fetching CPU metrics for instance ${instanceId}:`, error);
      return null;
    }
  }

  async getCpuUtilizationForInstances(
    cloudWatchClient: any,
    instanceIds: string[],
    periodInDays: number = 30,
  ): Promise<Map<string, number | null>> {
    const results = new Map<string, number | null>();
    const batchSize = 10;

    for (let i = 0; i < instanceIds.length; i += batchSize) {
      const batch = instanceIds.slice(i, i + batchSize);
      const promises = batch.map(async (instanceId) => {
        const cpu = await this.getAverageCpuUtilization(
          cloudWatchClient,
          instanceId,
          periodInDays,
        );
        return { instanceId, cpu };
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ instanceId, cpu }) => {
        results.set(instanceId, cpu);
      });

      if (i + batchSize < instanceIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  private async saveInstanceDetails(instance: any): Promise<InstanceDetails | null> {
    try {
      const instanceDetails = new InstanceDetails();
      instanceDetails.InstanceId = instance.InstanceId;
      instanceDetails.InstanceName = this.getInstanceName(instance);
      instanceDetails.InstanceSize = instance.InstanceType;
      instanceDetails.InstanceLocation = this.awsService.getRegion();
      instanceDetails.InstanceStatus = instance.State?.Name;
      instanceDetails.InstanceStatusTime = instance.State?.TransitionTime || new Date();
      instanceDetails.AvailabilityZone = instance.Placement?.AvailabilityZone;
      instanceDetails.VpcId = instance.VpcId;
      instanceDetails.SubnetId = instance.SubnetId;
      instanceDetails.PublicIp = instance.PublicIpAddress;
      instanceDetails.PrivateIp = instance.PrivateIpAddress;
      instanceDetails.PublicDns = instance.PublicDnsName;
      instanceDetails.PrivateDns = instance.PrivateDnsName;
      instanceDetails.AmiId = instance.ImageId;
      instanceDetails.InstanceLifecycle = instance.InstanceLifecycle;
      instanceDetails.VirtualizationType = instance.VirtualizationType;
      instanceDetails.Hypervisor = instance.Hypervisor;
      instanceDetails.Tenancy = instance.Placement?.Tenancy;
      instanceDetails.CpuCores = instance.CpuOptions?.CoreCount;
      instanceDetails.ThreadsPerCore = instance.CpuOptions?.ThreadsPerCore;
      instanceDetails.AutoScalingGroup = this.getAutoScalingGroup(instance);
      instanceDetails.InstanceDiskId = instance.BlockDeviceMappings?.[0]?.Ebs?.VolumeId;
      instanceDetails.InstanceNetworkInterfaceId =
        instance.NetworkInterfaces?.[0]?.NetworkInterfaceId;
      instanceDetails.IsActive = 1;
      instanceDetails.IsDisabled = 0;

      const existing = await this.instanceDetailsRepository.findOne({
        where: { InstanceId: instance.InstanceId },
      });

      if (existing) {
        Object.assign(existing, instanceDetails);
        return await this.instanceDetailsRepository.save(existing);
      } else {
        return await this.instanceDetailsRepository.save(instanceDetails);
      }
    } catch (error) {
      console.error('Error saving instance details:', error);
      return null;
    }
  }

  private getInstanceName(instance: any): string {
    const nameTag = instance.Tags?.find((tag: any) => tag.Key === 'Name');
    return nameTag?.Value || instance.InstanceId || '';
  }

  private getAutoScalingGroup(instance: any): string | null {
    const asgTag = instance.Tags?.find(
      (tag: any) => tag.Key === 'aws:autoscaling:groupName',
    );
    return asgTag?.Value || null;
  }

  async getAllDetectedResources(): Promise<IdleInstanceDetails[]> {
    return this.idleInstanceDetailsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getAllInstances(): Promise<InstanceDetails[]> {
    return this.instanceDetailsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getInstanceCpuUtilization(
    instanceId: string,
    periodInDays: number = 30,
  ): Promise<number | null> {
    const cloudWatchClient = this.awsService.getCloudWatchClient();
    return this.getAverageCpuUtilization(cloudWatchClient, instanceId, periodInDays);
  }
}

