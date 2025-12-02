import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Ec2Module } from './modules/ec2/ec2.module';
import { EcsModule } from './modules/ecs/ecs.module';
import { RdsModule } from './modules/rds/rds.module';
import { S3Module } from './modules/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    Ec2Module,
    EcsModule,
    RdsModule,
    S3Module,
  ],
})
export class AwsIrModule {}

