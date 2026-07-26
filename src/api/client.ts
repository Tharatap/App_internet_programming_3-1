import { API_BASE_URL } from '@/config';

/** Thrown when the API returns a non-2xx response; carries the server's message. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** JWT token to attach as `Authorization: Bearer <token>`. Omit for public endpoints. */
  token?: string | null;
}

/**
 * Thin fetch wrapper for the Express API (see server/README.md). Attaches the
 * JWT when given, parses JSON, and throws ApiError with the server's Thai
 * message on failure so call sites can show it directly to the user.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(data?.message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อ', res.status);
  }
  return data as T;
}
