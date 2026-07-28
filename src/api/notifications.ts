import { apiRequest } from '@/api/client';
import { AppNotification } from '@/types/shop';

export const notificationsApi = {
  list: (token: string) => apiRequest<AppNotification[]>('/notifications', { token }),

  markRead: (token: string, id: number) =>
    apiRequest<{ ok: true }>(`/notifications/${id}/read`, { method: 'PATCH', token }),
};
