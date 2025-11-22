import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RatingServiceController } from './rating-service.controller';
import { RatingService } from './rating-service.service';
import { RatingEntity } from './entities/rating.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('RATING_DB_HOST', 'rating-db'),
        port: Number(configService.get<number>('RATING_DB_PORT', 5432)),
        username: configService.get<string>('RATING_DB_USER', 'postgres'),
        password: configService.get<string>('RATING_DB_PASSWORD', 'postgres'),
        database: configService.get<string>('RATING_DB_NAME', 'rating_service'),
        entities: [RatingEntity],
        synchronize: true, // dev only - use migrations in production
      }),
    }),
    TypeOrmModule.forFeature([RatingEntity]),
    // gRPC clients for other services
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../proto/user.proto'),
          url: process.env.USER_GRPC_URL || 'localhost:5005',
        },
      },
      {
        name: 'SHRINE_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'shrine',
          protoPath: join(__dirname, '../../../proto/shrine.proto'),
          url: process.env.SHRINE_GRPC_URL || 'localhost:5001',
        },
      },
    ]),
  ],
  controllers: [RatingServiceController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingServiceModule {}
