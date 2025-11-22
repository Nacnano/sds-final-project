import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TechniqueController } from './technique-service.controller';
import { TechniqueService } from './technique-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TechniqueEntity,
  TechniqueSchema,
} from 'apps/technique-service/src/schemas/technique.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Existing MongoDB (NoSQL) Configuration
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('TECHNIQUE_DATABASE_URI'),
      }),
    }),
    MongooseModule.forFeature([
      { name: TechniqueEntity.name, schema: TechniqueSchema },
    ]),
  ],
  controllers: [TechniqueController],
  providers: [TechniqueService],
})
export class TechniqueServiceModule {}