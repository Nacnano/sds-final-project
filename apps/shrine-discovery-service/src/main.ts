import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ShrineDiscoveryServiceModule } from './shrine-discovery-service.module';

async function bootstrap() {
  const port = process.env.SHRINE_DISCOVERY_GRPC_PORT || '5003';
  const protoPath =
    process.env.NODE_ENV === 'local'
      ? join(__dirname, '../../../proto/shrine-discovery.proto')
      : join(__dirname, '../proto/shrine-discovery.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ShrineDiscoveryServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'shrine_discovery',
        protoPath,
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();
  console.log(
    `Shrine Discovery microservice is running on port ${port} with ${process.env.NODE_ENV} mode`,
  );
}
bootstrap();
