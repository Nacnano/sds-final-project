import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { LocationController } from './location.controller';

@Module({
	imports: [
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
	controllers: [LocationController],
	providers: [],
})
export class LocationModule {}
