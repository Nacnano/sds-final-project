import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { LocationService } from './location-service.service';

@Controller()
export class LocationServiceController {
  constructor(private readonly locationService: LocationService) {}

  @GrpcMethod('LocationService', 'GetCoordinates')
  async getCoordinates({ location }: { location: string }) {
    if (!location) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Missing required field: location' });
    }
    return await this.locationService.getCoordinates(location);
  }

  @GrpcMethod('LocationService', 'GetDistance')
  async getDistance({ origin, destination }: { origin: string; destination: string }) {
    if (!origin || !destination) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Missing required fields: origin and destination' });
    }
    return await this.locationService.getDistance(origin, destination);
  }
}
