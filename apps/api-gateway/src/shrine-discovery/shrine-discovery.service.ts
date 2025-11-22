import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  RecommendShrineRequest,
  RecommendShrineResponse,
  GetNearbyShrineRequest,
  SearchByCategoryRequest,
  ShrinesListResponse,
  ShrineDiscoveryServiceClient,
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

@Injectable()
export class ShrineDiscoveryService implements OnModuleInit {
  private shrineDiscoveryClientService: ShrineDiscoveryServiceClient;

  constructor(
    @Inject('SHRINE_DISCOVERY_PACKAGE')
    private readonly shrineDiscoveryClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.shrineDiscoveryClientService =
      this.shrineDiscoveryClient.getService<ShrineDiscoveryServiceClient>(
        'ShrineDiscoveryService',
      );
  }

  recommendShrine(
    request: Omit<RecommendShrineRequest, 'userId'>,
  ): Observable<RecommendShrineResponse> {
    const requestWithUser = { ...request, userId: 'default-user' }; // TODO: Implement user authentication
    return this.shrineDiscoveryClientService.recommendShrine(requestWithUser);
  }

  getNearbyShrine(
    request: GetNearbyShrineRequest,
  ): Observable<ShrinesListResponse> {
    return this.shrineDiscoveryClientService.getNearbyShrine(request);
  }

  searchShrinesByCategory(
    request: SearchByCategoryRequest,
  ): Observable<ShrinesListResponse> {
    return this.shrineDiscoveryClientService.searchShrinesByCategory(request);
  }

  searchShrines(request: SearchShrinesRequest): Observable<any> {
    return (this.shrineDiscoveryClientService as any).searchShrines(request).pipe(
      map((response: any) => {
        // Transform backend ShrineItem[] to frontend ShrineRecommendation[] format
        if (response && response.shrines) {
          // Debug: Log first shrine to check photoUrl
          if (response.shrines.length > 0) {
            console.log('[API Gateway] First shrine from shrine-discovery service:', JSON.stringify({
              id: response.shrines[0].id,
              name: response.shrines[0].name,
              photoUrl: response.shrines[0].photoUrl,
              hasPhotoUrl: !!response.shrines[0].photoUrl,
              allKeys: Object.keys(response.shrines[0]),
            }));
          }

          const mapped = {
            shrines: response.shrines.map((shrine: any) => ({
              shrineId: shrine.id,
              shrineName: shrine.name,
              description: shrine.description,
              category: Array.isArray(shrine.category) ? shrine.category[0] : shrine.category,
              rating: shrine.averageRating || 0,
              distanceKm: shrine.distance || 0,
              durationText: shrine.distance ? `${(shrine.distance * 60 / 50).toFixed(0)} min` : '',
              imageUrl: shrine.photoUrl || '',  // Backend uses photoUrl in proto
            })),
            total: response.total,
            page: response.page,
            totalPages: response.totalPages,
          };

          // Debug: Log mapped result
          if (mapped.shrines.length > 0) {
            console.log('[API Gateway] First shrine after mapping:', JSON.stringify({
              shrineId: mapped.shrines[0].shrineId,
              shrineName: mapped.shrines[0].shrineName,
              imageUrl: mapped.shrines[0].imageUrl,
              hasImageUrl: !!mapped.shrines[0].imageUrl,
            }));
          }

          return mapped;
        }
        return { shrines: [] };
      }),
    );
  }

  recommendShrines(request: RecommendShrinesRequest): Observable<any> {
    return (this.shrineDiscoveryClientService as any).recommendShrines(request);
  }

  getShrineAggregatedStats(
    request: GetShrineAggregatedStatsRequest,
  ): Observable<ShrineAggregatedStats> {
    return (this.shrineDiscoveryClientService as any).getShrineAggregatedStats(
      request,
    );
  }
}
