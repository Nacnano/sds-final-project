import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  OnModuleInit,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '@app/shared/auth/jwt-auth.guard';
import { CurrentUser } from '@app/shared/auth/current-user.decorator';

// Temporary interfaces until proto is compiled
interface UpsertRatingRequest {
  userId: string;
  shrineId: string;
  rating: number;
  review?: string;
  isAnonymous?: boolean;
}

interface GetShrineRatingsRequest {
  shrineId: string;
  page: number;
  limit: number;
}

interface GetUserRatingsRequest {
  userId: string;
  page: number;
  limit: number;
}

interface GetShrineStatsRequest {
  shrineId: string;
}

interface DeleteRatingRequest {
  id: string;
  userId: string;
}

interface RatingResponse {
  id: string;
  userId: string;
  shrineId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

interface RatingsResponse {
  ratings: RatingResponse[];
  total: number;
  page: number;
  limit: number;
}

interface ShrineStatsResponse {
  shrineId: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: string]: number };
}

interface RatingServiceClient {
  upsertRating(data: UpsertRatingRequest): Observable<RatingResponse>;
  getShrineRatings(data: GetShrineRatingsRequest): Observable<RatingsResponse>;
  getUserRatings(data: GetUserRatingsRequest): Observable<RatingsResponse>;
  getShrineStats(data: GetShrineStatsRequest): Observable<ShrineStatsResponse>;
  deleteRating(data: DeleteRatingRequest): Observable<any>;
}

@Controller('ratings')
export class RatingController implements OnModuleInit {
  private ratingService: RatingServiceClient;

  constructor(@Inject('RATING_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.ratingService =
      this.client.getService<RatingServiceClient>('RatingService');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrUpdateRating(
    @Body() body: Omit<UpsertRatingRequest, 'userId'>,
    @CurrentUser() currentUser?: any,
  ): Observable<RatingResponse> {
    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException('You must be logged in to rate a shrine');
    }

    if (!body.shrineId || !body.rating) {
      throw new BadRequestException('shrineId and rating are required');
    }

    if (body.rating < 1 || body.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    if (body.review && body.review.length > 500) {
      throw new BadRequestException('Review must not exceed 500 characters');
    }

    return this.ratingService.upsertRating({
      userId: currentUser.id,
      shrineId: body.shrineId,
      rating: body.rating,
      review: body.review,
      isAnonymous: body.isAnonymous,
    });
  }

  @Get('shrine/:shrineId')
  getShrineRatings(
    @Param('shrineId') shrineId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Observable<RatingsResponse> {
    if (!shrineId) {
      throw new BadRequestException('shrineId is required');
    }

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return this.ratingService.getShrineRatings({
      shrineId,
      page,
      limit,
    });
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getUserRatings(
    @Param('userId') userId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @CurrentUser() currentUser?: any,
  ): Observable<RatingsResponse> {
    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException('You must be logged in');
    }

    // Users can only view their own ratings unless they're admin
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      throw new ForbiddenException(
        "You don't have permission to view these ratings",
      );
    }

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return this.ratingService.getUserRatings({
      userId,
      page,
      limit,
    });
  }

  @Get('shrine/:shrineId/stats')
  getShrineStats(
    @Param('shrineId') shrineId: string,
  ): Observable<ShrineStatsResponse> {
    if (!shrineId) {
      throw new BadRequestException('shrineId is required');
    }

    return this.ratingService.getShrineStats({ shrineId });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteRating(
    @Param('id') id: string,
    @CurrentUser() currentUser?: any,
  ): Observable<any> {
    if (!currentUser || !currentUser.id) {
      throw new UnauthorizedException(
        'You must be logged in to delete a rating',
      );
    }

    if (!id) {
      throw new BadRequestException('Rating id is required');
    }

    return this.ratingService.deleteRating({
      id,
      userId: currentUser.id,
    });
  }
}
