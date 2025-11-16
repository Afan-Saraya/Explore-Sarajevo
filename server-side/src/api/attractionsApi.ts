import httpClient from './httpClient';
import { Attraction } from '@/types/content';

export const attractionsApi = {
  getAll: async (params?: {
    featured?: boolean;
    search?: string;
  }): Promise<Attraction[]> => {
    return httpClient.get<Attraction[]>('/api/attractions', { params });
  },

  getById: async (id: number): Promise<Attraction> => {
    return httpClient.get<Attraction>(`/api/attractions/${id}`);
  },

  create: async (data: Partial<Attraction>): Promise<Attraction> => {
    return httpClient.post<Attraction>('/api/attractions', data);
  },

  update: async (id: number, data: Partial<Attraction>): Promise<Attraction> => {
    return httpClient.put<Attraction>(`/api/attractions/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/attractions/${id}`);
  },
};

export default attractionsApi;
