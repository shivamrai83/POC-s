import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceDetails, IdleInstanceDetails } from '@libs/entities';
import { AwsModule } from './lib/aws/aws.module';
import { Ec2Module } from './modules/ec2/ec2.module';
import { EcsModule } from './modules/ecs/ecs.module';
import { RdsModule } from './modules/rds/rds.module';
import { S3Module } from './modules/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASS', 'postgres'),
        database: configService.get('DB_NAME', 'aws_cost_optimizer'),
        entities: [InstanceDetails, IdleInstanceDetails],
        synchronize: configService.get<boolean>('DB_SYNC', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
    }),
    AwsModule,
    Ec2Module,
    EcsModule,
    RdsModule,
    S3Module,
  ],
})
export class AwsIrModule {}

