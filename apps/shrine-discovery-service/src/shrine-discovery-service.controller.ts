import { Controller } from '@nestjs/common';
import { ShrineDiscoveryService } from './shrine-discovery-service.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  RecommendShrineRequest,
  RecommendShrineResponse,
  GetNearbyShrineRequest,
  SearchByCategoryRequest,
  ShrinesListResponse,
} from '@app/shared/interfaces/shrine-discovery';

@Controller()
export class ShrineDiscoveryController {
  constructor(
    private readonly shrineDiscoveryService: ShrineDiscoveryService,
  ) {}

  @GrpcMethod('ShrineDiscoveryService', 'RecommendShrine')
  async recommendShrine(
    data: RecommendShrineRequest,
  ): Promise<RecommendShrineResponse> {
    return this.shrineDiscoveryService.recommendShrine(data);
  }

  @GrpcMethod('ShrineDiscoveryService', 'GetNearbyShrine')
  async getNearbyShrine(
    data: GetNearbyShrineRequest,
  ): Promise<ShrinesListResponse> {
    return this.shrineDiscoveryService.getNearbyShrine(data);
  }

  @GrpcMethod('ShrineDiscoveryService', 'SearchShrinesByCategory')
  async searchShrinesByCategory(
    data: SearchByCategoryRequest,
  ): Promise<ShrinesListResponse> {
    return this.shrineDiscoveryService.searchShrinesByCategory(data);
  }

  @GrpcMethod('ShrineDiscoveryService', 'SearchShrines')
  async searchShrines(data: any): Promise<any> {
    return this.shrineDiscoveryService.searchShrines(data);
  }

  @GrpcMethod('ShrineDiscoveryService', 'RecommendShrines')
  async recommendShrines(data: any): Promise<any> {
    return this.shrineDiscoveryService.recommendShrines(data);
  }

  @GrpcMethod('ShrineDiscoveryService', 'GetShrineAggregatedStats')
  async getShrineAggregatedStats(data: any): Promise<any> {
    return this.shrineDiscoveryService.getShrineAggregatedStats(data);
  }
}
