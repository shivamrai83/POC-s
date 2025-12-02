import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('InstanceDetails')
export class InstanceDetails {
  @PrimaryGeneratedColumn({ name: 'Id' })
  Id: number;

  @Column({ name: 'InstanceId', nullable: true })
  InstanceId: string;

  @Column({ name: 'OrgId', nullable: true })
  OrgId: string;

  @Column({ name: 'AccountId', nullable: true })
  AccountId: string;

  @Column({ name: 'InstanceName', nullable: true })
  InstanceName: string;

  @Column({ name: 'InstanceLocation', nullable: true })
  InstanceLocation: string;

  @Column({ name: 'InstanceSize', nullable: true })
  InstanceSize: string;

  @Column({ name: 'OSType', nullable: true })
  OSType: string;

  @Column({ name: 'InstanceStorageAccountType', nullable: true })
  InstanceStorageAccountType: string;

  @Column({ name: 'OSName', nullable: true })
  OSName: string;

  @Column({ name: 'OSVersion', nullable: true })
  OSVersion: string;

  @Column({ name: 'InstancePricePerHour', type: 'float', nullable: true })
  InstancePricePerHour: number;

  @Column({ name: 'InstanceStatus', nullable: true })
  InstanceStatus: string;

  @Column({ name: 'InstanceStatusTime', type: 'timestamp', nullable: true })
  InstanceStatusTime: Date;

  @Column({ name: 'InstanceMemory', type: 'float', nullable: true })
  InstanceMemory: number;

  @Column({ name: 'InstanceAverageUsage', type: 'float', default: 0 })
  InstanceAverageUsage: number;

  @Column({ name: 'InstanceAvgNetworkIn', type: 'float', default: 0 })
  InstanceAvgNetworkIn: number;

  @Column({ name: 'InstanceAvgNetworkOut', type: 'float', default: 0 })
  InstanceAvgNetworkOut: number;

  @Column({ name: 'InstancePeakCPU', type: 'float', default: 0 })
  InstancePeakCPU: number;

  @Column({ name: 'InstanceDiskSize', nullable: true })
  InstanceDiskSize: string;

  @Column({ name: 'CurrencyCode', nullable: true })
  CurrencyCode: string;

  @Column({ name: 'DeleteOnTermination', nullable: true })
  DeleteOnTermination: boolean;

  @Column({ name: 'Days', type: 'int', default: 1 })
  Days: number;

  @Column({ name: 'UpperThreshold', type: 'int', default: 70 })
  UpperThreshold: number;

  @Column({ name: 'IsActive', type: 'int', default: 1 })
  IsActive: number;

  @Column({ name: 'IsDisabled', type: 'int', default: 0 })
  IsDisabled: number;

  @Column({ name: 'IsRecommendationAccepted', type: 'int', default: 0 })
  IsRecommendationAccepted: number;

  @Column({ name: 'InstanceDiskId', nullable: true })
  InstanceDiskId: string;

  @Column({ name: 'InstanceNetworkInterfaceId', nullable: true })
  InstanceNetworkInterfaceId: string;

  @Column({ name: 'Savings', type: 'float', default: 0 })
  Savings: number;

  @Column({ name: 'LastEndTime', type: 'timestamp', nullable: true })
  LastEndTime: Date;

  @Column({ name: 'UpscaleTime', type: 'int', default: 0 })
  UpscaleTime: number;

  @Column({ name: 'ThresholdUpdatedTime', type: 'timestamp', nullable: true })
  ThresholdUpdatedTime: Date;

  @Column({ name: 'IsResized', type: 'int', default: 0 })
  IsResized: number;

  @Column({ name: 'VirtualizationType', nullable: true })
  VirtualizationType: string;

  @Column({ name: 'Hypervisor', nullable: true })
  Hypervisor: string;

  @Column({ name: 'AutoScalingGroup', nullable: true })
  AutoScalingGroup: string;

  @Column({ name: 'InstanceLifecycle', nullable: true })
  InstanceLifecycle: string;

  @Column({ name: 'CpuCores', type: 'int', nullable: true })
  CpuCores: number;

  @Column({ name: 'ThreadsPerCore', type: 'int', nullable: true })
  ThreadsPerCore: number;

  @Column({ name: 'AmiId', nullable: true })
  AmiId: string;

  @Column({ name: 'Tenancy', nullable: true })
  Tenancy: string;

  @Column({ name: 'AvailabilityZone', nullable: true })
  AvailabilityZone: string;

  @Column({ name: 'VpcId', nullable: true })
  VpcId: string;

  @Column({ name: 'SubnetId', nullable: true })
  SubnetId: string;

  @Column({ name: 'PublicDns', nullable: true })
  PublicDns: string;

  @Column({ name: 'PrivateDns', nullable: true })
  PrivateDns: string;

  @Column({ name: 'PublicIp', nullable: true })
  PublicIp: string;

  @Column({ name: 'PrivateIp', nullable: true })
  PrivateIp: string;

  @Column({ name: 'CreatedBy', type: 'int', nullable: true })
  CreatedBy: number;

  @Column({ name: 'UpdatedBy', type: 'int', nullable: true })
  UpdatedBy: number;

  @Column({ name: 'IpAddress', nullable: true })
  IpAddress: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}


