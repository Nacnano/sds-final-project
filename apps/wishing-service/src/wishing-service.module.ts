import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WishingServiceController } from './wishing-service.controller';
import { WishingService } from './wishing-service.service';
import { redisFactory } from './redis.provider';
import { Wish } from './entities/wish.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('WISHING_DATABASE_HOST', 'localhost'),
        port: configService.get('WISHING_DATABASE_PORT', 5433),
        username: configService.get('WISHING_DATABASE_USER', 'postgres'),
        password: configService.get('WISHING_DATABASE_PASSWORD', 'postgres'),
        database: configService.get('WISHING_DATABASE_NAME', 'wishing_service'),
        entities: [Wish],
        synchronize: true, // Don't use in production
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Wish]),
    // gRPC client for shrine validation
    ClientsModule.registerAsync([
      {
        name: 'SHRINE_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'shrine',
            protoPath: process.env.NODE_ENV === 'local' 
              ? join(__dirname, '../../../proto/shrine.proto')
              : join(__dirname, '../proto/shrine.proto'),
            url: configService.get('SHRINE_SERVICE_URL', 'localhost:5001'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [WishingServiceController],
  providers: [WishingService, redisFactory],
})
export class WishingServiceModule {}
