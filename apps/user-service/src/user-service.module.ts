import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserServiceController } from './user-service.controller';
import { UserService } from './user-service.service';
import { UserEntity } from './entities/user.entity'; // TypeORM entity
import { AuthModule } from '@app/shared/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    // Root TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'user-db'),
        port: Number(configService.get<number>('DATABASE_PORT', 5432)),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
        database: configService.get<string>('USER_DATABASE_NAME', 'user_service'),
        entities: [UserEntity],
        synchronize: true, // dev only
      }),
    }),

    // Register repository for injection
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserServiceController],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
