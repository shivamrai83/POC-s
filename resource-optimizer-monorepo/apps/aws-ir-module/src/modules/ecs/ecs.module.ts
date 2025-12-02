import { Module } from '@nestjs/common';
import { EcsService } from './ecs.service';
import { EcsController } from './ecs.controller';
import { AwsModule } from '../../lib/aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [EcsController],
  providers: [EcsService],
  exports: [EcsService],
})
export class EcsModule {}

