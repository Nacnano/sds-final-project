import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RatingService } from './rating-service.service';

@Controller()
export class RatingServiceController {
  constructor(private readonly ratingService: RatingService) {}

  @GrpcMethod('RatingService', 'UpsertRating')
  async upsertRating(data: any) {
    return this.ratingService.upsertRating(data);
  }

  @GrpcMethod('RatingService', 'GetShrineRatings')
  async getShrineRatings(data: any) {
    return this.ratingService.getShrineRatings(data);
  }

  @GrpcMethod('RatingService', 'GetUserRatings')
  async getUserRatings(data: any) {
    return this.ratingService.getUserRatings(data);
  }

  @GrpcMethod('RatingService', 'GetShrineStats')
  async getShrineStats(data: any) {
    return this.ratingService.getShrineStats(data);
  }

  @GrpcMethod('RatingService', 'GetMultipleShrineStats')
  async getMultipleShrineStats(data: any) {
    return this.ratingService.getMultipleShrineStats(data);
  }

  @GrpcMethod('RatingService', 'DeleteRating')
  async deleteRating(data: any) {
    return this.ratingService.deleteRating(data);
  }
}
