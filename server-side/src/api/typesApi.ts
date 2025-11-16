import httpClient from './httpClient';
import { Type } from '@/types/content';

export const typesApi = {
  getAll: async (): Promise<Type[]> => {
    return httpClient.get<Type[]>('/api/types');
  },

  getById: async (id: number): Promise<Type> => {
    return httpClient.get<Type>(`/api/types/${id}`);
  },

  create: async (data: Partial<Type>): Promise<Type> => {
    return httpClient.post<Type>('/api/types', data);
  },

  update: async (id: number, data: Partial<Type>): Promise<Type> => {
    return httpClient.put<Type>(`/api/types/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/types/${id}`);
  },
};

export default typesApi;
