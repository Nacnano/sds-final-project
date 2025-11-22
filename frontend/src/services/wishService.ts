import api from './api';
import type { Wish, CreateWishRequest } from '../types';

export const wishService = {
  async getAll(params?: { shrineId?: string; wisherId?: string }): Promise<Wish[]> {
    const response = await api.get<{ wishes: Wish[] }>('/wishes', { params });
    return response.data.wishes;
  },

  async getById(id: string): Promise<Wish> {
    const response = await api.get<Wish>(`/wishes/${id}`);
    return response.data;
  },

  async create(data: CreateWishRequest): Promise<Wish> {
    const response = await api.post<Wish>('/wishes', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateWishRequest>): Promise<Wish> {
    const response = await api.patch<Wish>(`/wishes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<Wish> {
    const response = await api.delete<Wish>(`/wishes/${id}`);
    return response.data;
  },
};
