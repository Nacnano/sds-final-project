import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ShrineModule } from './shrine/shrine.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule as SharedAuthModule } from '@app/shared/auth/auth.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    SharedAuthModule,
    ShrineModule,
    LocationModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
