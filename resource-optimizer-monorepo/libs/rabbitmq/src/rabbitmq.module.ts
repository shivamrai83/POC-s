import {
  DynamicModule,
  Module,
  Provider,
} from '@nestjs/common';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_CLIENTS } from './rabbitmq.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQProducerService } from './rabbitmq.service';

@Module({})
export class RabbitMQModule {
  static register(queues: { name: string; queue: string }[]): DynamicModule {
    const clientMapProvider: Provider = {
      provide: RABBITMQ_CLIENTS,
      useFactory: (...clients: ClientProxy[]) => {
        const map = new Map<string, ClientProxy>();
        queues.forEach(({ name }, i) => map.set(name, clients[i]));
        return map;
      },
      inject: queues.map(({ name }) => name),
    };

    const asyncClientProviders = ClientsModule.registerAsync(
      queues.map(({ name, queue }) => ({
        name,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST_URL')],
            queue,
            queueOptions: { durable: false },
            socketOptions: {
              heartbeatIntervalInSeconds: 10,
            },
            retryAttempts: 5,
            retryDelay: 2000,
          },
        }),
      })),
    );

    return {
      module: RabbitMQModule,
      imports: [ConfigModule, asyncClientProviders],
      providers: [clientMapProvider, RabbitMQProducerService],
      exports: [clientMapProvider, RabbitMQProducerService],
    };
  }
}