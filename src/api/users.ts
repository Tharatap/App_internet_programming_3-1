import { apiRequest } from '@/api/client';

interface SettingsInput {
  language?: 'th' | 'en';
  theme?: 'light' | 'dark' | 'system';
  notifyPromo?: boolean;
}

export const usersApi = {
  updateSettings: (token: string, input: SettingsInput) =>
    apiRequest<{ ok: true }>('/users/me/settings', { method: 'PATCH', token, body: input }),
};
