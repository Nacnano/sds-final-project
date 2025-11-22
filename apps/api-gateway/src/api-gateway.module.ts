import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ShrineModule } from './shrine/shrine.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TechniqueModule } from 'apps/api-gateway/src/technique/technique.module';
import { AuthModule as SharedAuthModule } from '@app/shared/auth/auth.module';
import { AuthModule } from './auth/auth.module';
import { ShrineDiscoveryModule } from 'apps/api-gateway/src/shrine-discovery/shrine-discovery.module';
import { WishingModule } from './wishing/wishing.module';
import { RatingModule } from './rating/rating.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    SharedAuthModule,
    AuthModule,
    ShrineModule,
    TechniqueModule,
    UserModule,
    LocationModule,
    ShrineDiscoveryModule,
    WishingModule,
    RatingModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
