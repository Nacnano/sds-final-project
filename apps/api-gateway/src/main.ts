import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { GrpcToHttpExceptionFilter } from 'apps/api-gateway/src/common/filters/grpc-to-http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors();

  app.useGlobalFilters(new GrpcToHttpExceptionFilter());

  await app.listen(process.env.GATEWAY_PORT ?? 3000);
}
bootstrap();
