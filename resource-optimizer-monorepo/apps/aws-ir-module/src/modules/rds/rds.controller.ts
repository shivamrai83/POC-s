import { Controller, Get, Post } from '@nestjs/common';
import { RdsService } from './rds.service';

@Controller('rds')
export class RdsController {
  constructor(private readonly rdsService: RdsService) {}

  @Post('detect')
  async detectIdleResources() {
    return this.rdsService.detectIdleResources();
  }

  @Get('resources')
  async getAllResources() {
    return this.rdsService.getAllResources();
  }
}

