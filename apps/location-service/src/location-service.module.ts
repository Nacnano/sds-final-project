import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocationServiceController } from './location-service.controller';
import { LocationService } from './location-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: 'LOCATION_PACKAGE',
        imports: [ConfigModule],
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
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [LocationServiceController],
  providers: [LocationService],
})
export class LocationServiceModule {}
