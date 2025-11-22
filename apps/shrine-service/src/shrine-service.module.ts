import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShrineServiceController } from './shrine-service.controller';
import { ShrineService } from './shrine-service.service';
import { Shrine } from './entities/shrine.entity';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- Import necessary types
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      // ... (Your TypeORM configuration remains here)
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('SHRINE_DATABASE_PORT', 5432),
        username: configService.get('SHRINE_DATABASE_USER', 'postgres'),
        password: configService.get('SHRINE_DATABASE_PASSWORD', 'postgres'),
        database: configService.get('SHRINE_DATABASE_NAME', 'shrine_service'),
        entities: [Shrine],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Shrine]),

    ClientsModule.registerAsync([
      {
        name: 'SHRINE_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL', 'amqp://rabbitmq:5672'),
            ],
            queue: 'shrine_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'LOCATION_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'location',
            protoPath:
              process.env.NODE_ENV === 'local'
                ? join(__dirname, '../../../proto/location.proto')
                : join(__dirname, '../proto/location.proto'),
            url: configService.get('LOCATION_SERVICE_URL', 'localhost:'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ShrineServiceController],
  providers: [ShrineService],
})
export class ShrineServiceModule {}
