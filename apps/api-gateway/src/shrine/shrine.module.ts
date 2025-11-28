import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ShrineController } from './shrine.controller';

@Module({
  imports: [
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
            channelOptions: {
              'grpc.keepalive_time_ms': 10000, // Send keepalive ping every 10s
              'grpc.keepalive_timeout_ms': 5000, // Wait 5s for ping ack before considering connection dead
              'grpc.keepalive_permit_without_calls': 1, // Allow keepalive pings even when no calls are in flight
              'grpc.http2.max_pings_without_data': 0, // Allow unlimited pings without data
              'grpc.initial_reconnect_backoff_ms': 1000, // Initial backoff of 1s before reconnecting
              'grpc.max_reconnect_backoff_ms': 5000, // Max backoff of 5s between reconnection attempts
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'LOCATION_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'location',
            protoPath: join(__dirname, '../proto/location.proto'),
            url: configService.get('LOCATION_SERVICE_URL', 'localhost:5006'),
            channelOptions: {
              'grpc.keepalive_time_ms': 10000, // Send keepalive ping every 10s
              'grpc.keepalive_timeout_ms': 5000, // Wait 5s for ping ack before considering connection dead
              'grpc.keepalive_permit_without_calls': 1, // Allow keepalive pings even when no calls are in flight
              'grpc.http2.max_pings_without_data': 0, // Allow unlimited pings without data
              'grpc.initial_reconnect_backoff_ms': 1000, // Initial backoff of 1s before reconnecting
              'grpc.max_reconnect_backoff_ms': 5000, // Max backoff of 5s between reconnection attempts
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ShrineController],
})
export class ShrineModule {}
