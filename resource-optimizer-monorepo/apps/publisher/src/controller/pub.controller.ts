import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PublisherService } from '../services/pub.service';

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @MessagePattern('sync')
  async handleSyncMessage() {
    await this.publisherService.publishIdleSyncRequest();
    return {
      queued: true,
    };
  }

}