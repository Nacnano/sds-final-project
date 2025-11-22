import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RatingController } from './rating.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RATING_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'rating',
          protoPath: join(__dirname, '../proto/rating.proto'),
          url: process.env.RATING_SERVICE_URL || 'localhost:5007',
        },
      },
    ]),
  ],
  controllers: [RatingController],
})
export class RatingModule {}
