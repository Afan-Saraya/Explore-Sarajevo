import httpClient from './httpClient';

export interface Section {
  id: number;
  name: string;
  slug: string;
  description?: string;
  domain?: string;
  image?: string;
  display_order: number;
  is_active: boolean;
  featured: boolean;
  meta?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
}

export const sectionsApi = {
  getAll: async (): Promise<Section[]> => {
    return httpClient.get<Section[]>('/api/sections');
  },

  getById: async (id: number): Promise<Section> => {
    return httpClient.get<Section>(`/api/sections/${id}`);
  },

  getBySlug: async (slug: string): Promise<Section> => {
    return httpClient.get<Section>(`/api/sections/slug/${slug}`);
  },

  create: async (data: Partial<Section>): Promise<Section> => {
    return httpClient.post<Section>('/api/sections', data);
  },

  update: async (id: number, data: Partial<Section>): Promise<Section> => {
    return httpClient.put<Section>(`/api/sections/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/api/sections/${id}`);
  },

  reorder: async (orderedIds: number[]): Promise<void> => {
    return httpClient.put<void>('/api/sections/reorder', { orderedIds });
  },
};

export default sectionsApi;
