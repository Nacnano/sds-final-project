import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ShrineDiscoveryService } from './shrine-discovery.service';
import type {
  RecommendShrineRequest,
  RecommendShrineResponse,
  GetNearbyShrineRequest,
  SearchByCategoryRequest,
  ShrinesListResponse,
} from '@app/shared/interfaces/shrine-discovery';

// Temporary interfaces for new methods
interface SearchShrinesRequest {
  query?: string;
  category?: string[];
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

interface RecommendShrinesRequest {
  userId: string;
  userLatitude?: number;
  userLongitude?: number;
  maxDistance?: number;
  limit?: number;
}

interface GetShrineAggregatedStatsRequest {
  shrineId: string;
}

interface ShrineAggregatedStats {
  shrineId: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: string]: number };
  totalWishes: number;
  recentWishes: number;
  topWishCategories: Array<{ category: string; count: number }>;
}

@Controller('shrine-discovery')
export class ShrineDiscoveryController {
  constructor(
    private readonly shrineDiscoveryService: ShrineDiscoveryService,
  ) {}

  @Post('recommend')
  recommendShrine(
    @Body() request: Omit<RecommendShrineRequest, 'userId'>,
  ): Observable<RecommendShrineResponse> {
    return this.shrineDiscoveryService.recommendShrine(request);
  }

  @Get('nearby')
  getNearbyShrine(
    @Query('location') location: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('sortBy') sortBy?: string,
  ): Observable<ShrinesListResponse> {
    return this.shrineDiscoveryService.getNearbyShrine({
      location: location,
      radiusKm: radiusKm ? parseInt(radiusKm) : undefined,
      sortBy,
    });
  }

  @Get('search/category')
  searchByCategory(
    @Query('category') category: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
  ): Observable<ShrinesListResponse> {
    return this.shrineDiscoveryService.searchShrinesByCategory({
      category,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    });
  }

  @Get('search')
  searchShrines(
    @Query('query') query?: string,
    @Query('category') category?: string | string[],
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('maxDistance') maxDistance?: string,
    @Query('minRating') minRating?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Observable<any> {
    const request: SearchShrinesRequest = {
      query,
      category: category ? (Array.isArray(category) ? category : [category]) : undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sortBy,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    };

    if (request.page && request.page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }

    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return this.shrineDiscoveryService.searchShrines(request);
  }

  @Get('recommend-personalized')
  recommendPersonalized(
    @Query('userId') userId: string,
    @Query('userLatitude') userLatitude?: string,
    @Query('userLongitude') userLongitude?: string,
    @Query('maxDistance') maxDistance?: string,
    @Query('limit') limit?: string,
  ): Observable<any> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const request: RecommendShrinesRequest = {
      userId,
      userLatitude: userLatitude ? parseFloat(userLatitude) : undefined,
      userLongitude: userLongitude ? parseFloat(userLongitude) : undefined,
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined,
      limit: limit ? parseInt(limit) : 10,
    };

    return this.shrineDiscoveryService.recommendShrines(request);
  }

  @Get('stats/:shrineId')
  getShrineAggregatedStats(
    @Param('shrineId') shrineId: string,
  ): Observable<ShrineAggregatedStats> {
    if (!shrineId) {
      throw new BadRequestException('shrineId is required');
    }

    return this.shrineDiscoveryService.getShrineAggregatedStats({ shrineId });
  }
}
