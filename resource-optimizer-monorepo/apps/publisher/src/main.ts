import { NestFactory } from '@nestjs/core';
import { PublisherModule } from './invoice.module';

async function bootstrap() {
  const app = await NestFactory.create(PublisherModule);
 await app.listen(3000);
  console.log('Publisher microservice is running on port 3000');
}
bootstrap();