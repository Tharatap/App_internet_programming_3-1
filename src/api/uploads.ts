import { apiRequest } from '@/api/client';

interface UploadImageInput {
  fileName: string;
  mimeType: string;
  data: string;
}

export const uploadsApi = {
  uploadImage: (token: string, input: UploadImageInput) =>
    apiRequest<{ url: string }>('/uploads', { method: 'POST', token, body: input }),
};
