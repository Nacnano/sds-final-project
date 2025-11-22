import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { TechniqueController } from './technique.controller';
import { TechniqueService } from './technique.service';

@Module({
  imports: [
    HttpModule,
    ClientsModule.registerAsync([
      {
        name: 'SHRINE_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'shrine',
            protoPath: join(__dirname, '../proto/shrine.proto'),
            url: configService.get('SHRINE_SERVICE_URL', 'localhost:5001'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TechniqueController],
  providers: [TechniqueService],
})
export class TechniqueModule {}
