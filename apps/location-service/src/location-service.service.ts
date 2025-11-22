import { Injectable, Logger } from '@nestjs/common';
import { Client, GeocodeResponse, DistanceMatrixResponse } from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class LocationService {
  private readonly client = new Client({});
  private readonly apiKey: string;
  private readonly logger = new Logger(LocationService.name);

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!key) {
      throw new Error('Missing GOOGLE_MAPS_API_KEY in environment');
    }
    this.apiKey = key;
  }

  async getCoordinates(address: string) {
    this.logger.log(`Attempting to geocode address: "${address}"`);
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      this.logger.debug(`Geocode API response status: ${response.data.status}`);
      
      if (!response.data.results || response.data.results.length === 0) {
        this.logger.warn(`No coordinates found for address: ${address}`);
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'No coordinates found for the given address',
        });
      }

      const location = response.data.results[0].geometry.location;
      this.logger.log(`Successfully geocoded "${address}" to lat: ${location.lat}, lng: ${location.lng}`);
      return location;
    } catch (error) {
      this.logger.error(`Error getting coordinates for "${address}":`, error.message, error.response?.data);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to get coordinates from Google Maps API',
      }); 
    }
  }

  async getDistance(origin: string, destination: string) {
    try {
      const res = await this.client.distancematrix({
        params: {
          origins: [origin],
          destinations: [destination],
          key: this.apiKey,
        },
      });
      this.logger.debug(JSON.stringify(res.data, null, 2));
      if (!res.data.rows?.[0]?.elements?.[0] || res.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
        this.logger.warn(`No route found between ${origin} and ${destination}`);
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'No route found between the given locations',
        });
      }

      const element = res.data.rows[0].elements[0];
      this.logger.debug('Route element:', JSON.stringify(element, null, 2));
      
      if (element.status !== 'OK') {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: `Route calculation failed: ${element.status}`,
        });
      }

      const result = {
        distanceText: element.distance.text,
        distanceValue: element.distance.value,
        durationText: element.duration.text,
        durationValue: element.duration.value,
      };
      
      this.logger.debug('Returning result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      this.logger.error(`Error getting distance between ${origin} and ${destination}: ${error.message}`);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to get distance from Google Maps API',
      });
    }
  }
}
