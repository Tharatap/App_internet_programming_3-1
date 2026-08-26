import { useRouter } from 'expo-router';
import { LogIn, ShieldAlert } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';

interface Props {
  children: ReactNode;
}

/**
 * Gates a screen behind login AND admin role. Same shape as RequireAuth, plus
 * a "แอดมินเท่านั้น" state for signed-in non-admin users. Used by /admin/* screens.
 */
export function AdminGuard({ children }: Props) {
  const router = useRouter();
  const { loading, isAuthenticated, user, isAdminSession, logout } = useAuth();

  const switchToAdmin = async () => {
    await logout();
    router.replace('/(auth)/login?intent=admin');
  };

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
        <Text style={styles.title}>กรุณาเข้าสู่ระบบ</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อใช้งานส่วนนี้ของแอป</Text>
        <PressableScale style={styles.button} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
        </PressableScale>
      </View>
    );
  }

  if (!isAdminSession) {
    const isAdminAccount = user?.isAdmin === true;

    return (
      <View style={styles.center}>
        <View style={styles.icon}>
          <ShieldAlert size={28} color={Brand.textSecondary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>
          {isAdminAccount ? 'คุณเข้าสู่ระบบในโหมดลูกค้า' : 'หน้านี้สำหรับแอดมินเท่านั้น'}
        </Text>
        <Text style={styles.subtitle}>
          {isAdminAccount
            ? 'กรุณาเข้าสู่ระบบผ่านช่องทางแอดมินเพื่อใช้งานส่วนนี้'
            : 'บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนนี้'}
        </Text>
        <PressableScale
          style={styles.button}
          onPress={isAdminAccount ? switchToAdmin : () => router.back()}>
          <Text style={styles.buttonText}>
            {isAdminAccount ? 'เข้าสู่ระบบแอดมิน' : 'ย้อนกลับ'}
          </Text>
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
