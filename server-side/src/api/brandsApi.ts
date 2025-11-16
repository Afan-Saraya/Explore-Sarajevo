import httpClient from './httpClient';
import { Brand } from '@/types/content';

export const brandsApi = {
  getAll: async (params?: { search?: string; parent_id?: number }): Promise<Brand[]> => {
    return httpClient.get<Brand[]>('/api/brands', { params });
  },

  getById: async (id: number): Promise<Brand> => {
    return httpClient.get<Brand>(`/api/brands/${id}`);
  },

  create: async (data: Partial<Brand>): Promise<Brand> => {
    return httpClient.post<Brand>('/api/brands', data);
  },

  update: async (id: number, data: Partial<Brand>): Promise<Brand> => {
    return httpClient.put<Brand>(`/api/brands/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/brands/${id}`);
  },
};

export default brandsApi;
