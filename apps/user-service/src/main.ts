import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const port = process.env.USER_GRPC_PORT || '5003';
  const protoPath = process.env.NODE_ENV === 'local' 
    ? join(__dirname, '../../../proto/user.proto')
    : join(__dirname, '../proto/user.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath,
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();
  console.log(`User microservice is running on port ${port} with ${process.env.NODE_ENV} mode`);
}
bootstrap();