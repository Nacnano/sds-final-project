import type { CoordinatesRequest, CoordinatesResponse, DistanceRequest, DistanceResponse, LocationServiceClient } from '@app/shared/interfaces/location';
import { Controller, Get, Post, Body, Query, Inject, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';


@Controller('location')
export class LocationController implements OnModuleInit {
	private readonly logger = new Logger(LocationController.name);
	private locationService: LocationServiceClient;

	constructor(@Inject('LOCATION_PACKAGE') private client: ClientGrpc) {}

	onModuleInit() {
		this.locationService = this.client.getService<LocationServiceClient>('LocationService');
	}

	@Post('coordinates')
	async getCoordinates(@Body() request: CoordinatesRequest): Promise<CoordinatesResponse> {
		this.logger.log(`getCoordinates called location=${request.location}`);
		if (!request.location) {
			this.logger.warn('Missing location in request body');
			throw new BadRequestException('Missing required field: location');
		}
		
		try {
			const observable = this.locationService.getCoordinates(request);
			const response = await firstValueFrom<CoordinatesResponse>(observable);
			this.logger.debug('Coordinates response:', JSON.stringify(response, null, 2));
			return response;
		} catch (error) {
			this.logger.error('Error processing coordinates request:', error);
			throw error;
		}
	}

	@Post('distance')
	async getDistance(
		@Body() request: DistanceRequest
	): Promise<DistanceResponse> {
		this.logger.log(`getDistance called origin=${request.origin} destination=${request.destination}`);
		if (!request.origin || !request.destination) {
			this.logger.warn('Missing origin or destination in request body');
			throw new BadRequestException('Missing required fields: origin and destination');
		}
		
		try {
			const observable = this.locationService.getDistance(request);
			const response = await firstValueFrom<DistanceResponse>(observable);
			this.logger.debug('Distance response:', JSON.stringify(response, null, 2));
			return response;
		} catch (error) {
			this.logger.error('Error processing distance request:', error);
			throw error;
		}
	}
}
