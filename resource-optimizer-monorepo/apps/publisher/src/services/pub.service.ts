import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export const SYNC_PUBLISHER_CLIENT = 'SYNC_PUBLISHER_CLIENT';

@Injectable()
export class PublisherService {
  constructor(
    @Inject(SYNC_PUBLISHER_CLIENT)
    private readonly syncPublisherClient: ClientProxy,
  ) {}

  async publishIdleSyncRequest(): Promise<void> {
    await firstValueFrom(
      this.syncPublisherClient.emit('idle-sync-request', {
        msg: 'checkidle',
        startSync: true,
      }),
    );
  }
}