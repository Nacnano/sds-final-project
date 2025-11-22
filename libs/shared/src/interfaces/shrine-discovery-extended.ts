// Extensions for shrine-discovery service interfaces
// These extend the auto-generated interfaces from proto compilation
import { Observable } from 'rxjs';

export interface SearchShrinesRequest {
  query?: string;
  category?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface RecommendShrinesRequest {
  userId: string;
  userLatitude?: number;
  userLongitude?: number;
  maxDistance?: number;
  limit?: number;
}

export interface GetShrineAggregatedStatsRequest {
  shrineId: string;
}

export interface ShrineWithScore {
  shrineId: string;
  shrineName: string;
  description: string;
  category: string;
  province: string;
  latitude: number;
  longitude: number;
  score: number;
  distance?: number;
  averageRating?: number;
  totalRatings?: number;
  wishCount?: number;
}

export interface SearchShrinesResponse {
  shrines: ShrineWithScore[];
  total: number;
  page: number;
  limit: number;
}

export interface RecommendShrinesResponse {
  shrines: ShrineWithScore[];
}

export interface WishCategory {
  category: string;
  count: number;
}

export interface ShrineAggregatedStats {
  shrineId: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: string]: number };
  totalWishes: number;
  recentWishes: number;
  topWishCategories: WishCategory[];
}

// Extended client interface
export interface ShrineDiscoveryServiceClientExtended {
  searchShrines(
    request: SearchShrinesRequest,
  ): Observable<SearchShrinesResponse>;
  recommendShrines(
    request: RecommendShrinesRequest,
  ): Observable<RecommendShrinesResponse>;
  getShrineAggregatedStats(
    request: GetShrineAggregatedStatsRequest,
  ): Observable<ShrineAggregatedStats>;
}
