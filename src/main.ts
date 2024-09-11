import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Payments-MicroService')
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.setGlobalPrefix('api');

  logger.log(`Running on port ${envs.port}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  await app.listen(envs.port);
}
bootstrap();
