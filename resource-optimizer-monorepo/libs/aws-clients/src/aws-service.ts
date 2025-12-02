import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EC2 } from '@aws-sdk/client-ec2';
import { RDSClient } from '@aws-sdk/client-rds';
import { ECSClient } from '@aws-sdk/client-ecs';
import { ElasticLoadBalancingV2Client } from '@aws-sdk/client-elastic-load-balancing-v2';
import { ElasticLoadBalancingClient } from '@aws-sdk/client-elastic-load-balancing';
import { S3Client } from '@aws-sdk/client-s3';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';

@Injectable()
export class AwsService {
  private ec2Client: EC2;
  private rdsClient: RDSClient;
  private ecsClient: ECSClient;
  private elbv2Client: ElasticLoadBalancingV2Client;
  private elbClient: ElasticLoadBalancingClient;
  private s3Client: S3Client;
  private cloudWatchClient: CloudWatchClient;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    
    const awsConfig: any = {
      region: this.region,
    };

    // Support both access keys and IAM role patterns
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    if (accessKeyId && secretAccessKey) {
      awsConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.ec2Client = new EC2(awsConfig);
    this.rdsClient = new RDSClient(awsConfig);
    this.ecsClient = new ECSClient(awsConfig);
    this.elbv2Client = new ElasticLoadBalancingV2Client(awsConfig);
    this.elbClient = new ElasticLoadBalancingClient(awsConfig);
    this.s3Client = new S3Client(awsConfig);
    this.cloudWatchClient = new CloudWatchClient(awsConfig);
  }

  getEC2Client(): EC2 {
    return this.ec2Client;
  }

  getRDSClient(): RDSClient {
    return this.rdsClient;
  }

  getECSClient(): ECSClient {
    return this.ecsClient;
  }

  getELBv2Client(): ElasticLoadBalancingV2Client {
    return this.elbv2Client;
  }

  getELBClient(): ElasticLoadBalancingClient {
    return this.elbClient;
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getCloudWatchClient(): CloudWatchClient {
    return this.cloudWatchClient;
  }

  getRegion(): string {
    return this.region;
  }
}

