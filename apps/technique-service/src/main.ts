import { NestFactory } from '@nestjs/core';
import { TechniqueServiceModule } from './technique-service.module';

async function bootstrap() {
  const port = process.env.TECHNIQUE_HTTP_PORT || '5002';

  const app = await NestFactory.create(TechniqueServiceModule);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(port);
  console.log(
    `Technique service is running on port ${port} with ${process.env.NODE_ENV} mode`,
  );
}
bootstrap();
