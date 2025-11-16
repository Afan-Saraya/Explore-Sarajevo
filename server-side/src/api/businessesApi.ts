import httpClient from './httpClient';
import { Business } from '@/types/content';

export const businessesApi = {
  getAll: async (params?: {
    brand_id?: number;
    featured?: boolean;
    search?: string;
  }): Promise<Business[]> => {
    return httpClient.get<Business[]>('/api/businesses', { params });
  },

  getById: async (id: number): Promise<Business> => {
    return httpClient.get<Business>(`/api/businesses/${id}`);
  },

  create: async (data: Partial<Business>): Promise<Business> => {
    return httpClient.post<Business>('/api/businesses', data);
  },

  update: async (id: number, data: Partial<Business>): Promise<Business> => {
    return httpClient.put<Business>(`/api/businesses/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/businesses/${id}`);
  },
};

export default businessesApi;
