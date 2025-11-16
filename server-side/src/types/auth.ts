export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}
