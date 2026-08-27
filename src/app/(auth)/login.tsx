import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { TopBar } from '@/components/shop/top-bar';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useBrand } from '@/store/theme-store';

/**
 * หน้าเข้าสู่ระบบ — ใช้ร่วมกัน 2 ช่องทางจากหน้า welcome
 *   /(auth)/login                → ช่องทางลูกค้า
 *   /(auth)/login?intent=admin   → ช่องทางแอดมิน (ดู isAdminIntent ด้านล่าง)
 *
 * ทางเดินของข้อมูล: onSubmit() → auth-store.login() → api/auth.ts → POST /api/auth/login
 */
export default function LoginScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  // อ่าน query param จาก URL — welcome.tsx ส่ง ?intent=admin มาเมื่อกดการ์ด "เข้าสู่ระบบแอดมิน"
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const { login, logout } = useAuth();
  const isAdminIntent = intent === 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // กันกดปุ่มซ้ำระหว่างรอ API ตอบ
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // พารามิเตอร์ที่ 3 คือ "โหมดของเซสชัน" — ล็อกอินช่องทางลูกค้าจะไม่ได้สิทธิ์แอดมิน
      // ถึงแม้บัญชีนั้นจะเป็นแอดมินก็ตาม (ดู sessionRole ใน auth-store)
      const loggedInUser = await login(
        email.trim(),
        password,
        isAdminIntent ? 'admin' : 'customer'
      );
      if (isAdminIntent) {
        if (loggedInUser.isAdmin) {
          // วาง (tabs) ไว้ใน stack ก่อน แล้วค่อย push หน้าแอดมิน
          // เพื่อให้ปุ่มย้อนกลับในหน้าแอดมินมีที่ไปที่สมเหตุสมผล
          router.replace('/(tabs)');
          router.push('/admin/products');
          return;
        }

        // เข้าช่องทางแอดมินด้วยบัญชีธรรมดา → ออกจากระบบทันที ไม่ปล่อยให้ล็อกอินค้างไว้
        await logout();
        setError('บัญชีนี้ไม่มีสิทธิ์แอดมิน');
        return;
      }
      router.replace('/(tabs)');
    } catch (err) {
      // auth-store แปลง ApiError เป็นข้อความไทยมาให้แล้ว
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      // ต้องอยู่ใน finally ไม่งั้นปุ่มค้างเป็น "กำลังเข้าสู่ระบบ..." ตลอดเมื่อ API ล้ม
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* onBack ใช้ replace ไป welcome เสมอ (ไม่ใช้ back) เพราะผู้ใช้อาจเปิด URL /login ตรงๆ
          หรือถูกส่งมาจาก RequireAuth ในแท็บอื่น — ย้อนกลับไป welcome ให้ผลที่คาดเดาได้เสมอ */}
      <TopBar
        variant="list"
        title={isAdminIntent ? 'เข้าสู่ระบบแอดมิน' : 'เข้าสู่ระบบ'}
        showBack
        onBack={() => router.replace('/(auth)/welcome')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>ยินดีต้อนรับกลับสู่ Chaje Electric</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Brand.textMuted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Brand.textMuted}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PressableScale
            accessibilityRole="button"
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Text>
          </PressableScale>
        </View>

        <PressableScale
          accessibilityRole="button"
          style={styles.footerLink}
          onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.footerText}>
            ยังไม่มีบัญชี? <Text style={styles.footerLinkText}>สมัครสมาชิก</Text>
          </Text>
        </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
    marginTop: 6,
  },
  form: {
    marginTop: 32,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  input: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Brand.text,
  },
  error: {
    fontSize: 13,
    color: Brand.danger,
  },
  submitButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
  footerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  footerLinkText: {
    color: Brand.successText,
    fontWeight: '700',
  },
});
