import { Controller, Get, Post } from '@nestjs/common';
import { Ec2Service } from './ec2.service';

@Controller('ec2')
export class Ec2Controller {
  constructor(private readonly ec2Service: Ec2Service) {}

  @Post('detect')
  async detectIdleResources() {
    return this.ec2Service.detectIdleResources();
  }

  @Get('idle-resources')
  async getIdleResources() {
    return this.ec2Service.getAllDetectedResources();
  }

  @Get('instances')
  async getAllInstances() {
    return this.ec2Service.getAllInstances();
  }
}

