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
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** JWT token to attach as `Authorization: Bearer <token>`. Omit for public endpoints. */
  token?: string | null;
}

/**
 * ตัวยิง HTTP กลางของทั้งแอป — **ทุก request ที่คุยกับ Express ผ่านฟังก์ชันนี้ที่เดียว**
 * (ไฟล์ใน src/api/ ทุกตัวเรียกตัวนี้ ไม่มีใครเรียก fetch เองโดยตรง)
 *
 * รวมงานที่ต้องทำซ้ำทุกครั้งไว้จุดเดียว: ต่อ base URL, แนบ JWT, แปลง JSON,
 * และโยน ApiError พร้อมข้อความไทยจาก server ให้หน้าจอเอาไปแสดงได้ทันที
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // แนบ JWT เฉพาะเมื่อมี — endpoint สาธารณะอย่าง /products ไม่ต้องใช้
  // ฝั่ง server จะถอด token ตัวนี้ที่ middleware/auth.js แล้วได้ req.userId
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // อ่านเป็น text ก่อนแล้วค่อย parse เอง — เพราะบาง response ไม่มี body เลย
  // (เช่น DELETE ที่คืน 204) ถ้าเรียก res.json() ตรงๆ จะพังตรงนั้น
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // server ออกแบบให้ error ทุกตัวมีรูปแบบ { message } เหมือนกันหมด
    // (ดู middleware/error.js) จึงหยิบมาใช้ต่อได้เลยโดยไม่ต้องแปลตาม status
    throw new ApiError(data?.message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อ', res.status);
  }
  return data as T;
}
