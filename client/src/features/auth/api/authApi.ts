import { apiClient } from '@shared/api/client';
import type { User } from '@entities/user/types';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginDto): Promise<AuthResponse> => apiClient.post('/auth/login', data),
  register: (data: RegisterDto): Promise<AuthResponse> => apiClient.post('/auth/register', data),
};

