import { useRouter } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';

interface Props {
  children: ReactNode;
  /** Shown above the login prompt, e.g. "ตะกร้าสินค้า". */
  title?: string;
}

/**
 * Gates a screen behind login. Shows a spinner while a saved session is being
 * restored, a "please log in" prompt when signed out, or `children` once
 * authenticated. Used by cart/favorites/profile — screens that need a user.
 */
export function RequireAuth({ children, title }: Props) {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.text} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <View style={styles.icon}>
          <LogIn size={28} color={Brand.textSecondary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>{title ? `เข้าสู่ระบบเพื่อดู${title}` : 'กรุณาเข้าสู่ระบบ'}</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อใช้งานส่วนนี้ของแอป</Text>
        <PressableScale style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
        </PressableScale>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
