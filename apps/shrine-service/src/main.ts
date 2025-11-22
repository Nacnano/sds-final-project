import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ShrineServiceModule } from './shrine-service.module';

async function bootstrap() {
  const port = process.env.SHRINE_GRPC_PORT || '5001';
  const protoPath =
    process.env.NODE_ENV === 'local'
      ? join(__dirname, '../../../proto/shrine.proto')
      : join(__dirname, '../proto/shrine.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ShrineServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'shrine',
        protoPath,
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();
  console.log(
    `Shrine microservice is running on port ${port} with ${process.env.NODE_ENV} mode`,
  );
}
bootstrap();
