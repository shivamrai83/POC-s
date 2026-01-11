import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceDetails, IdleInstanceDetails } from '@libs/entities';
import { Ec2Service } from './ec2.service';
import { Ec2Controller } from './ec2.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstanceDetails, IdleInstanceDetails]),
  ],
  controllers: [Ec2Controller],
  providers: [Ec2Service],
  exports: [Ec2Service],
})
export class Ec2Module {}

