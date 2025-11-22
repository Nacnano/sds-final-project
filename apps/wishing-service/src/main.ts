import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WishingServiceModule } from './wishing-service.module';

async function bootstrap() {
  const port = process.env.WISHING_GRPC_PORT || '5003';
  const protoPath = process.env.NODE_ENV === 'local' 
    ? join(__dirname, '../../../proto/wishing.proto')
    : join(__dirname, '../proto/wishing.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WishingServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'wishing',
        protoPath,
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();
  console.log(`Wishing microservice is running on port ${port} with ${process.env.NODE_ENV} mode`);
}
bootstrap();
