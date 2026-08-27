import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DarkBrand, LightBrand, type BrandPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { secureStorage } from '@/utils/secure-storage';

const THEME_MODE_KEY = 'chaje_theme_mode';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedThemeMode;
  brand: BrandPalette;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setStoredMode] = useState<ThemeMode>('light');

  useEffect(() => {
    let active = true;

    secureStorage.getItem(THEME_MODE_KEY).then((savedMode) => {
      if (active && isThemeMode(savedMode)) {
        setStoredMode(savedMode);
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setStoredMode(nextMode);
    void secureStorage.setItem(THEME_MODE_KEY, nextMode).catch(() => {});
  }, []);

  const resolved: ResolvedThemeMode = mode === 'system'
    ? systemScheme === 'dark' ? 'dark' : 'light'
    : mode;
  const brand = resolved === 'dark' ? DarkBrand : LightBrand;

  const value = useMemo(
    () => ({ mode, resolved, brand, setMode }),
    [brand, mode, resolved, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Theme hooks must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeMode() {
  const { mode, resolved, setMode } = useThemeContext();
  return { mode, resolved, setMode };
}

export function useBrand(): BrandPalette {
  return useThemeContext().brand;
}
