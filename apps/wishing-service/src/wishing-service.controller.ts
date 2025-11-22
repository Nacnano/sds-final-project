import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WishingService } from './wishing-service.service';
import type {
  CreateWishRequest,
  FindWishByIdRequest,
  FindAllWishesRequest,
  UpdateWishByIdRequest,
  WishResponse,
  WishesResponse,
} from '@app/shared/interfaces/wishing';

@Controller()
export class WishingServiceController {
  constructor(private readonly wishingService: WishingService) {}

  @GrpcMethod('WishingService', 'CreateWish')
  async createWish(data: CreateWishRequest): Promise<WishResponse> {
    return this.wishingService.createWish(data);
  }

  @GrpcMethod('WishingService', 'FindWishById')
  async findWishById(data: FindWishByIdRequest): Promise<WishResponse> {
    return this.wishingService.findWishById(data.id);
  }

  @GrpcMethod('WishingService', 'FindAllWishes')
  async findAllWishes(data: FindAllWishesRequest): Promise<WishesResponse> {
    const wishes = await this.wishingService.findAllWishes(data);
    return { wishes };
  }

  @GrpcMethod('WishingService', 'UpdateWishById')
  async updateWishById(data: UpdateWishByIdRequest): Promise<WishResponse> {
    return this.wishingService.updateWishById(data);
  }

  @GrpcMethod('WishingService', 'DeleteWishById')
  async deleteWishById(data: FindWishByIdRequest): Promise<WishResponse> {
    return this.wishingService.deleteWishById(data.id);
  }

  @GrpcMethod('WishingService', 'GetShrineWishCount')
  async getShrineWishCount(data: { shrineId: string }): Promise<any> {
    return this.wishingService.getShrineWishCount(data.shrineId);
  }
}
