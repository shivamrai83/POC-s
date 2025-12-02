import { Module } from '@nestjs/common';
import { RdsService } from './rds.service';
import { RdsController } from './rds.controller';
import { AwsModule } from '../../lib/aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [RdsController],
  providers: [RdsService],
  exports: [RdsService],
})
export class RdsModule {}

