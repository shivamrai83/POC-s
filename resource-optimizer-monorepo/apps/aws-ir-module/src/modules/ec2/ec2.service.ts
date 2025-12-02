import { Injectable } from '@nestjs/common';
import { AwsService } from '../../lib/aws/aws.service';

@Injectable()
export class Ec2Service {
  constructor(private readonly awsService: AwsService) {}

  async detectIdleResources(): Promise<any[]> {
    // TODO: implement idle detection using this.awsService.getEC2Client()
    return [];
  }

  async getAllDetectedResources(): Promise<any[]> {
    // TODO: implement persistence lookup
    return [];
  }

  async getAllInstances(): Promise<any[]> {
    // TODO: fetch EC2 instances using AWS SDK clients
    return [];
  }
}

