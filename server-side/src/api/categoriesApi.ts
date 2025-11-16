import httpClient from './httpClient';
import { Category } from '@/types/content';

export const categoriesApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    return httpClient.get<Category[]>('/api/categories');
  },

  // Get category by ID
  getById: async (id: number): Promise<Category> => {
    return httpClient.get<Category>(`/api/categories/${id}`);
  },

  // Create category
  create: async (data: Partial<Category>): Promise<Category> => {
    return httpClient.post<Category>('/api/categories', data);
  },

  // Update category
  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    return httpClient.put<Category>(`/api/categories/${id}`, data);
  },

  // Delete category
  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/categories/${id}`);
  },
};

export default categoriesApi;
