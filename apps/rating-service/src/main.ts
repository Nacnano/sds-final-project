import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RatingServiceModule } from './rating-service.module';

async function bootstrap() {
  const port = process.env.RATING_GRPC_PORT || '5007';
  const protoPath = join(__dirname, '../../../proto/rating.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RatingServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'rating',
        protoPath,
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();
  console.log(
    `Rating microservice is running on port ${port} with ${process.env.NODE_ENV} mode`,
  );
}
bootstrap();
