import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UserController } from './user.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'USER_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'user',
            protoPath: join(__dirname, '../proto/user.proto'),
            url: configService.get('USER_SERVICE_URL', 'localhost:5003'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
