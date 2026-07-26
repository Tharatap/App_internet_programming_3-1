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

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  /** True while restoring a saved session on app start. */
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
        setToken(saved);
        setUser(me);
      } catch {
        await secureStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      await secureStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      throw new Error(toMessage(err));
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const res = await authApi.register(email, password, name);
      await secureStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      throw new Error(toMessage(err));
    }
  }, []);

  const logout = useCallback(async () => {
    await secureStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
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
