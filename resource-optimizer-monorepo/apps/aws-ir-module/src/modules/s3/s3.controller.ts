import { Controller, Get, Post } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('detect')
  async detectIdleResources() {
    return this.s3Service.detectIdleResources();
  }

  @Get('resources')
  async getAllResources() {
    return this.s3Service.getAllResources();
  }
}

