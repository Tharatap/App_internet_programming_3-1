import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { AppFrameWidth, Brand, PixelBorder, PixelFonts } from '@/constants/theme';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((nextMessage: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(nextMessage);
    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, 3000);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.provider}>
        {children}
        {message ? (
          <View
            style={styles.toast}
            pointerEvents="none"
            accessibilityLiveRegion="polite">
            <Text style={styles.message}>{message}</Text>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? AppFrameWidth - 32 : undefined,
    bottom: 90,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
    textAlign: 'center',
  },
});
