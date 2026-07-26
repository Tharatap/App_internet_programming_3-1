import { useRouter } from 'expo-router';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>สมัครสมาชิก</Text>
        <Text style={styles.subtitle}>สร้างบัญชีเพื่อเริ่มช้อปกับ Chaje Electric</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>ชื่อ</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="ชื่อของคุณ"
              placeholderTextColor={Brand.textMuted}
              autoComplete="name"
            />
          </View>

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
              placeholder="อย่างน้อย 8 ตัวอักษร"
              placeholderTextColor={Brand.textMuted}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PressableScale
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}</Text>
          </PressableScale>
        </View>

        <PressableScale style={styles.footerLink} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.footerText}>
            มีบัญชีอยู่แล้ว? <Text style={styles.footerLinkText}>เข้าสู่ระบบ</Text>
          </Text>
        </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.text,
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
