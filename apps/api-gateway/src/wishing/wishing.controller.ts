import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Inject, 
  OnModuleInit, 
  Patch, 
  Delete,
  Query
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import type {
  CreateWishRequest,
  UpdateWishByIdRequest,
  WishResponse,
  WishesResponse,
  WishingServiceClient,
} from '@app/shared/interfaces/wishing';

@Controller('wishes')
export class WishingController implements OnModuleInit {
  private wishingService: WishingServiceClient;

  constructor(@Inject('WISHING_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.wishingService = this.client.getService<WishingServiceClient>('WishingService');
  }

  @Post()
  createWish(@Body() createWishDto: CreateWishRequest): Observable<WishResponse> {
    return this.wishingService.createWish(createWishDto);
  }

  @Get(':id')
  findWishById(@Param('id') id: string): Observable<WishResponse> {
    return this.wishingService.findWishById({ id });
  }

  @Get()
  findAllWishes(
    @Query('shrineId') shrineId?: string,
    @Query('wisherId') wisherId?: string,
  ): Observable<WishesResponse> {
    return this.wishingService.findAllWishes({ 
      shrineId, 
      wisherId 
    });
  }

  @Patch(':id')
  updateWishById(
    @Param('id') id: string, 
    @Body() updateWishDto: Omit<UpdateWishByIdRequest, 'id'>
  ): Observable<WishResponse> {
    return this.wishingService.updateWishById({ id, ...updateWishDto });
  }

  @Delete(':id')
  deleteWishById(@Param('id') id: string): Observable<WishResponse> {
    return this.wishingService.deleteWishById({ id });
  }
}
