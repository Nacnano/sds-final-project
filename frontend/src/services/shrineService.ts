import api from './api';
import type { Shrine, CreateShrineRequest } from '../types';

export const shrineService = {
  async getAll(): Promise<Shrine[]> {
    try {
      const response = await api.get<{ shrines: Shrine[] }>('/shrines');
      // Ensure we always return an array
      return Array.isArray(response.data?.shrines) ? response.data.shrines : [];
    } catch (error) {
      console.error('Error in shrineService.getAll:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Shrine> {
    const response = await api.get<Shrine>(`/shrines/${id}`);
    return response.data;
  },

  async create(data: CreateShrineRequest): Promise<Shrine> {
    const response = await api.post<Shrine>('/shrines', data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<CreateShrineRequest>,
  ): Promise<Shrine> {
    const response = await api.patch<Shrine>(`/shrines/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/shrines/${id}`);
  },

  async findNearby(location: string, radius: number): Promise<Shrine[]> {
    const response = await api.get<{ shrines: Shrine[] }>('/shrines/nearby/search', {
      params: { location, radius },
    });
    return response.data.shrines;
  },
};
