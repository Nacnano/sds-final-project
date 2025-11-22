import api from './api';
import type { RecommendShrineRequest, RecommendShrineResponse, ShrineRecommendation } from '../types';

export const discoveryService = {
  async recommend(data: RecommendShrineRequest): Promise<RecommendShrineResponse> {
    const response = await api.post<RecommendShrineResponse>('/shrine-discovery/recommend', data);
    return response.data;
  },

  async getNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
    sortBy?: string;
  }): Promise<ShrineRecommendation[]> {
    // Combine latitude and longitude into location string format expected by backend
    const requestParams = {
      location: `${params.latitude},${params.longitude}`,
      radiusKm: params.radiusKm,
      sortBy: params.sortBy,
    };
    const response = await api.get<{ shrines: ShrineRecommendation[] }>('/shrine-discovery/nearby', { params: requestParams });
    return response.data.shrines;
  },

  async searchByCategory(params: {
    category: string;
    latitude?: number;
    longitude?: number;
  }): Promise<ShrineRecommendation[]> {
    const response = await api.get<{ shrines: ShrineRecommendation[] }>('/shrine-discovery/search/category', { params });
    return response.data.shrines;
  },

  async search(params: {
    query?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    maxDistance?: number;
    minRating?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ shrines: ShrineRecommendation[] }> {
    const response = await api.get<{ shrines: ShrineRecommendation[] }>('/shrine-discovery/search', { params });
    return response.data;
  },
};
