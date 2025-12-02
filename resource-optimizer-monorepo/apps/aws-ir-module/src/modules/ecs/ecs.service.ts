import { Injectable } from '@nestjs/common';
import { AwsService } from '../../lib/aws/aws.service';

@Injectable()
export class EcsService {
  constructor(
    private awsService: AwsService,
  ) {}

  async detectIdleResources(): Promise<any[]> {
    // TODO: Implement ECS idle resource detection
    return [];
  }

  async getAllResources(): Promise<any[]> {
    // TODO: Implement get all ECS resources
    return [];
  }
}

