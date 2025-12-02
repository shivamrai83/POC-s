import { Module } from '@nestjs/common';
import { PublisherController } from './controller/pub.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PublisherService, SYNC_PUBLISHER_CLIENT } from './services/pub.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: SYNC_PUBLISHER_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_HOST_URL') ??
                'amqp://guest:guest@localhost:5672',
            ],
            queue:
              configService.get<string>('RABBITMQ_SYNC_QUEUE') ??
              'publisher.sync.queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [PublisherController],
  providers: [PublisherService],
  exports: [],
})
export class PublisherModule {}