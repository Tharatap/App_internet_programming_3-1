import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError } from '@/api/client';
import { authApi, ApiUser } from '@/api/auth';
import { usersApi } from '@/api/users';
import { secureStorage } from '@/utils/secure-storage';

const TOKEN_KEY = 'chaje_auth_token';
const ROLE_KEY = 'chaje_session_role';

export type SessionRole = 'customer' | 'admin';

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  /** True while restoring a saved session on app start. */
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  sessionRole: SessionRole;
  isAdminSession: boolean;
  login: (email: string, password: string, mode?: SessionRole) => Promise<ApiUser>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  updateSettings: (patch: Partial<ApiUser['settings']>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turns a thrown error (ApiError or network failure) into a Thai message for the UI. */
function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่';
}

/**
 * ศูนย์กลางสถานะการล็อกอินของทั้งแอป — ครอบไว้ที่ src/app/_layout.tsx
 *
 * เก็บ 3 เรื่องแยกกัน อย่าสับสน:
 *   user / token   ล็อกอินอยู่หรือไม่
 *   isGuest        เข้าแบบผู้เยี่ยมชม (ดูสินค้าได้ แต่ใช้ตะกร้า/โปรไฟล์ไม่ได้)
 *   sessionRole    เซสชันนี้ใช้สิทธิ์แอดมินอยู่หรือไม่ — คนละเรื่องกับ user.isAdmin
 *                  ที่บอกแค่ว่า "บัญชีนี้เป็นแอดมิน"
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // true ระหว่างกำลังกู้เซสชันเดิมตอนเปิดแอป — ใช้กันหน้าจอกะพริบไปหน้า welcome ก่อนเวลา
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [sessionRole, setSessionRole] = useState<SessionRole>('customer');

  // กู้เซสชันเดิมตอนเปิดแอป: เอา token ที่เก็บไว้ไปถาม /auth/me ว่ายังใช้ได้อยู่ไหม
  useEffect(() => {
    (async () => {
      const saved = await secureStorage.getItem(TOKEN_KEY);
      if (!saved) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me(saved);
        const savedRole = await secureStorage.getItem(ROLE_KEY);
        setToken(saved);
        setUser(me);
        // ไม่เชื่อค่าใน storage อย่างเดียว — ต้อง `&& me.isAdmin` ด้วย
        // ถ้าอาจารย์ถอดสิทธิ์แอดมินใน DB ผู้ใช้คนนั้น refresh ปุ๊บสิทธิ์หลุดทันที
        setSessionRole(savedRole === 'admin' && me.isAdmin ? 'admin' : 'customer');
      } catch {
        // token หมดอายุหรือถูกแก้ → ล้างทิ้ง ให้ล็อกอินใหม่
        await secureStorage.removeItem(TOKEN_KEY);
        await secureStorage.removeItem(ROLE_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * เข้าสู่ระบบ
   * @param mode ช่องทางที่ล็อกอินเข้ามา — 'admin' จะได้สิทธิ์แอดมินก็ต่อเมื่อบัญชีเป็นแอดมินจริง
   * @returns ข้อมูลผู้ใช้ (คืนค่าออกไปเพื่อให้หน้า login เช็ค isAdmin ได้ทันที
   *          ห้ามอ่านจาก state `user` หลัง await เพราะยังเป็นค่าเก่าอยู่)
   */
  const login = useCallback(async (
    email: string,
    password: string,
    mode: SessionRole = 'customer'
  ) => {
    try {
      const res = await authApi.login(email, password);
      const role: SessionRole = mode === 'admin' && res.user.isAdmin ? 'admin' : 'customer';
      await secureStorage.setItem(TOKEN_KEY, res.token);
      // เก็บโหมดไว้ด้วย เพื่อให้แอดมินกด refresh บนเว็บแล้วไม่หลุดจากโหมดแอดมินกลางคัน
      await secureStorage.setItem(ROLE_KEY, role);
      setToken(res.token);
      setUser(res.user);
      setSessionRole(role);
      return res.user;
    } catch (err) {
      // แปลง ApiError เป็นข้อความไทยให้หน้าจอเอาไปแสดงได้เลย
      throw new Error(toMessage(err));
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const res = await authApi.register(email, password, name);
      await secureStorage.setItem(TOKEN_KEY, res.token);
      await secureStorage.setItem(ROLE_KEY, 'customer');
      setToken(res.token);
      setUser(res.user);
      setSessionRole('customer');
    } catch (err) {
      throw new Error(toMessage(err));
    }
  }, []);

  /** ออกจากระบบ — ต้องล้างให้ครบทุกอย่าง ไม่งั้นสถานะเก่าค้างข้ามผู้ใช้ */
  const logout = useCallback(async () => {
    await secureStorage.removeItem(TOKEN_KEY);
    await secureStorage.removeItem(ROLE_KEY);
    setToken(null);
    setUser(null);
    setIsGuest(false);
    setSessionRole('customer');
  }, []);

  // โหมดผู้เยี่ยมชม — ตั้งใจไม่ persist ลง storage
  // (ปิดแอป/refresh แล้วต้องกลับไปหน้า welcome ให้เลือกใหม่)
  const enterGuestMode = useCallback(() => setIsGuest(true), []);
  const exitGuestMode = useCallback(() => setIsGuest(false), []);

  /**
   * แก้การตั้งค่า (ธีม / ภาษา / แจ้งเตือนโปรฯ)
   * อัปเดต state ในเครื่องทันทีแล้วค่อยยิง API แบบไม่รอผล (fire-and-forget)
   * → หน้าจอตอบสนองทันที และหน้าอื่นที่อ่าน user.settings เห็นค่าใหม่พร้อมกันหมด
   */
  const updateSettings = useCallback((patch: Partial<ApiUser['settings']>) => {
    // ใช้ functional update กันอ่านค่า user เก่าจาก closure
    setUser((prev) => prev
      ? { ...prev, settings: { ...prev.settings, ...patch } }
      : prev);
    if (token) {
      void usersApi.updateSettings(token, patch).catch(() => {});
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isGuest,
      sessionRole,
      // ต้องเป็นแอดมินจริง **และ** ล็อกอินผ่านช่องทางแอดมินเท่านั้น
      // แอดมินที่ล็อกอินช่องทางลูกค้าจะได้ false → ไม่เห็นเมนูและเข้า /admin/* ไม่ได้
      isAdminSession: !!user?.isAdmin && sessionRole === 'admin',
      login,
      register,
      logout,
      enterGuestMode,
      exitGuestMode,
      updateSettings,
    }),
    [
      user,
      token,
      loading,
      isGuest,
      sessionRole,
      login,
      register,
      logout,
      enterGuestMode,
      exitGuestMode,
      updateSettings,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
