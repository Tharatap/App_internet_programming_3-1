import { apiRequest } from '@/api/client';

export interface ApiUser {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
  settings: {
    language: 'th' | 'en';
    theme: 'light' | 'dark' | 'system';
    notifyPromo: boolean;
  };
}

interface AuthResponse {
  token: string;
  user: ApiUser;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    }),

  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),

  me: (token: string) => apiRequest<ApiUser>('/auth/me', { token }),
};
