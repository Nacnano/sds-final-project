import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { WishingController } from './wishing.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'WISHING_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'wishing',
            protoPath: join(__dirname, '../proto/wishing.proto'),
            url: configService.get('WISHING_SERVICE_URL', 'localhost:5003'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [WishingController],
})
export class WishingModule {}
