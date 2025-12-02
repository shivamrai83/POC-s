import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AwsIrModule } from './aws-ir.module';

async function bootstrap() {
  const app = await NestFactory.create(AwsIrModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`AWS IR Module is running on: http://localhost:${port}`);
}

bootstrap();

