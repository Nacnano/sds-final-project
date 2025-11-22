import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ShrineDiscoveryController } from './shrine-discovery.controller';
import { ShrineDiscoveryService } from './shrine-discovery.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'SHRINE_DISCOVERY_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'shrine_discovery',
            protoPath: join(__dirname, '../proto/shrine-discovery.proto'),
            url: configService.get(
              'SHRINE_DISCOVERY_SERVICE_URL',
              'localhost:5003',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ShrineDiscoveryController],
  providers: [ShrineDiscoveryService],
})
export class ShrineDiscoveryModule {}
