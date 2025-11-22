import { Shrine } from '../entities/shrine.entity';
// TODO: Shrine imported here is not from the shared library, need to fix later

export interface RecommendedShrine {
  shrine: Shrine;
  score: number;
  distance?: number;
}

export interface ShrineDiscoveryResponse {
  recommendations: RecommendedShrine[];
}
