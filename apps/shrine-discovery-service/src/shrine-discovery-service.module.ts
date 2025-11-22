import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShrineDiscoveryController } from './shrine-discovery-service.controller';
import { ShrineDiscoveryService } from './shrine-discovery-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ShrineDiscoveryEntity,
  ShrineDiscoverySchema,
} from './schemas/shrine-discovery.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('SHRINE_DISCOVERY_DATABASE_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: ShrineDiscoveryEntity.name, schema: ShrineDiscoverySchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'SHRINE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'shrine',
            protoPath:
              process.env.NODE_ENV === 'local'
                ? join(__dirname, '../../../proto/shrine.proto')
                : join(__dirname, '../proto/shrine.proto'),
            url: configService.get<string>('SHRINE_SERVICE_URL'),
          },
        }),
      },
      {
        name: 'RATING_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'rating',
            protoPath:
              process.env.NODE_ENV === 'local'
                ? join(__dirname, '../../../proto/rating.proto')
                : join(__dirname, '../proto/rating.proto'),
            url:
              configService.get<string>('RATING_SERVICE_URL') ||
              'localhost:5007',
          },
        }),
      },
      {
        name: 'WISHING_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'wishing',
            protoPath:
              process.env.NODE_ENV === 'local'
                ? join(__dirname, '../../../proto/wishing.proto')
                : join(__dirname, '../proto/wishing.proto'),
            url:
              configService.get<string>('WISHING_SERVICE_URL') ||
              'localhost:5004',
          },
        }),
      },
      {
        name: 'LOCATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'location',
            protoPath:
              process.env.NODE_ENV === 'local'
                ? join(__dirname, '../../../proto/location.proto')
                : join(__dirname, '../proto/location.proto'),
            url: configService.get('LOCATION_SERVICE_URL', 'localhost:5006'),
          },
        }),
      },
    ]),
  ],
  controllers: [ShrineDiscoveryController],
  providers: [ShrineDiscoveryService],
})
export class ShrineDiscoveryServiceModule {}
