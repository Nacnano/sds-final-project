import { NestFactory } from '@nestjs/core';
import { LocationServiceModule } from './location-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const port = process.env.LOCATION_GRPC_PORT ?? '5006';
  const protoPath =
    process.env.NODE_ENV === 'local'
      ? join(__dirname, '../../../proto/location.proto')
      : join(__dirname, '../proto/location.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      LocationServiceModule,
      {
        transport: Transport.GRPC,
        options: {
          package: 'location',
          protoPath,
          url: `0.0.0.0:${port}`,
        },
      },
    );

  await app.listen();
}

bootstrap();
