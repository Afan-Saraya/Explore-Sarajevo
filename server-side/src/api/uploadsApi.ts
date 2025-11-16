import httpClient from './httpClient';
import { UploadedFile } from '@/types/content';

export const uploadsApi = {
  // Get all uploaded files
  getAll: async (): Promise<{ files: UploadedFile[] }> => {
    return httpClient.get<{ files: UploadedFile[] }>('/api/uploads');
  },

  // Upload a file
  upload: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ filename: string; path: string; url: string }> => {
    return httpClient.upload<{ filename: string; path: string; url: string }>(
      '/api/upload',
      file,
      onProgress
    );
  },
};

export default uploadsApi;
