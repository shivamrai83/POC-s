import { Injectable } from '@nestjs/common';
import { AwsService } from '../../lib/aws/aws.service';

@Injectable()
export class S3Service {
  constructor(
    private awsService: AwsService,
  ) {}

  async detectIdleResources(): Promise<any[]> {
    // TODO: Implement S3 idle resource detection
    return [];
  }

  async getAllResources(): Promise<any[]> {
    // TODO: Implement get all S3 resources
    return [];
  }
}

