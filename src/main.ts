import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments-MicroService')
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  app.setGlobalPrefix('api', {
    exclude:[{
      path:'', method: RequestMethod.GET
    }]
  });
  logger.log(`Running on port ${envs.port}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true
    })
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers
    },
  },
    {
      inheritAppConfig: true
    });

  await app.startAllMicroservices();

  await app.listen(envs.port);
}
bootstrap();
