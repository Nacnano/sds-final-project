import api from './api';
import type { Technique, CreateTechniqueRequest } from '../types';

export const techniqueService = {
  async getAll(): Promise<Technique[]> {
    const response = await api.get<{ techniques: Technique[] }>('/techniques');
    return response.data.techniques;
  },

  async getById(id: string): Promise<Technique> {
    const response = await api.get<{ technique: Technique }>(`/techniques/${id}`);
    return response.data.technique;
  },

  async create(data: CreateTechniqueRequest): Promise<Technique> {
    const response = await api.post<{ technique: Technique }>('/techniques', data);
    return response.data.technique;
  },

  async update(id: string, data: Partial<CreateTechniqueRequest>): Promise<Technique> {
    const response = await api.patch<{ technique: Technique }>(`/techniques/${id}`, data);
    return response.data.technique;
  },

  async delete(id: string): Promise<Technique> {
    const response = await api.delete<{ technique: Technique }>(`/techniques/${id}`);
    return response.data.technique;
  },
};
