import { Controller, Get, Post } from '@nestjs/common';
import { EcsService } from './ecs.service';

@Controller('ecs')
export class EcsController {
  constructor(private readonly ecsService: EcsService) {}

  @Post('detect')
  async detectIdleResources() {
    return this.ecsService.detectIdleResources();
  }

  @Get('resources')
  async getAllResources() {
    return this.ecsService.getAllResources();
  }
}

