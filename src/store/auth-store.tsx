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
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turns a thrown error (ApiError or network failure) into a Thai message for the UI. */
function toMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [sessionRole, setSessionRole] = useState<SessionRole>('customer');

  // Restore a saved session on app start by validating the stored token.
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
        setSessionRole(savedRole === 'admin' && me.isAdmin ? 'admin' : 'customer');
      } catch {
        await secureStorage.removeItem(TOKEN_KEY);
        await secureStorage.removeItem(ROLE_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (
    email: string,
    password: string,
    mode: SessionRole = 'customer'
  ) => {
    try {
      const res = await authApi.login(email, password);
      const role: SessionRole = mode === 'admin' && res.user.isAdmin ? 'admin' : 'customer';
      await secureStorage.setItem(TOKEN_KEY, res.token);
      await secureStorage.setItem(ROLE_KEY, role);
      setToken(res.token);
      setUser(res.user);
      setSessionRole(role);
      return res.user;
    } catch (err) {
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

  const logout = useCallback(async () => {
    await secureStorage.removeItem(TOKEN_KEY);
    await secureStorage.removeItem(ROLE_KEY);
    setToken(null);
    setUser(null);
    setIsGuest(false);
    setSessionRole('customer');
  }, []);

  const enterGuestMode = useCallback(() => setIsGuest(true), []);
  const exitGuestMode = useCallback(() => setIsGuest(false), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isGuest,
      sessionRole,
      isAdminSession: !!user?.isAdmin && sessionRole === 'admin',
      login,
      register,
      logout,
      enterGuestMode,
      exitGuestMode,
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
