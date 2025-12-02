import { Inject, Injectable, Scope } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_CLIENTS } from './rabbitmq.constants';

@Injectable({ scope: Scope.DEFAULT })
export class RabbitMQProducerService {
  constructor(
    @Inject(RABBITMQ_CLIENTS)
    private readonly clients: Map<string, ClientProxy>
  ) {}

  async sendMessage<T = any>(
    clientName: string,
    pattern: string,
    data: any,
  ): Promise<T> {
    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`RabbitMQ client "${clientName}" not found register in module.`);
    }

    return client.send<T>(pattern, data).toPromise();
  }
}