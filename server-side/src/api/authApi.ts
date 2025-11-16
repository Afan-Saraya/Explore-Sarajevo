import httpClient from './httpClient';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse>('/api/auth/login', credentials);
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return httpClient.post<AuthResponse>('/api/auth/register', data);
  },

  // Logout
  logout: async (): Promise<void> => {
    return httpClient.post<void>('/api/auth/logout');
  },

  // Get current user
  me: async (): Promise<{ user: User }> => {
    return httpClient.get<{ user: User }>('/api/auth/me');
  },
};

export default authApi;
