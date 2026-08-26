import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usersApi } from '@/api/users';
import { Checkbox } from '@/components/shop/checkbox';
import { ConfirmModal } from '@/components/shop/confirm-modal';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { searchHistory } from '@/utils/search-history';

const THEME_OPTIONS = [
  { value: 'light', label: 'สว่าง' },
  { value: 'dark', label: 'มืด' },
  { value: 'system', label: 'ตามระบบ' },
] as const;

const LANGUAGE_OPTIONS = [
  { value: 'th', label: 'ไทย' },
  { value: 'en', label: 'English' },
] as const;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { showToast } = useToast();

  const [theme, setTheme] = useState(user?.settings.theme ?? 'light');
  const [language, setLanguage] = useState(user?.settings.language ?? 'th');
  const [notifyPromo, setNotifyPromo] = useState(user?.settings.notifyPromo ?? true);
  const [clearCacheVisible, setClearCacheVisible] = useState(false);

  const saveTheme = (value: typeof theme) => {
    setTheme(value);
    if (token) usersApi.updateSettings(token, { theme: value }).catch(() => {});
  };
  const saveLanguage = (value: typeof language) => {
    setLanguage(value);
    if (token) usersApi.updateSettings(token, { language: value }).catch(() => {});
  };
  const saveNotifyPromo = (value: boolean) => {
    setNotifyPromo(value);
    if (token) usersApi.updateSettings(token, { notifyPromo: value }).catch(() => {});
  };

  const onClearCache = () => {
    setClearCacheVisible(true);
  };

  const onClearCacheConfirm = async () => {
    await searchHistory.clear();
    setClearCacheVisible(false);
    showToast('ล้างประวัติการค้นหาแล้ว');
  };

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="ตั้งค่า" showBack />
      <RequireAuth title="ตั้งค่า">
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ธีม</Text>
            <View style={styles.chipRow}>
              {THEME_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={theme === opt.value}
                  onPress={() => saveTheme(opt.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ภาษา</Text>
            <View style={styles.chipRow}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={language === opt.value}
                  onPress={() => saveLanguage(opt.value)}
                />
              ))}
            </View>
          </View>

          <PressableScale style={styles.row} onPress={() => saveNotifyPromo(!notifyPromo)}>
            <Checkbox
              checked={notifyPromo}
              onToggle={() => saveNotifyPromo(!notifyPromo)}
              accessibilityLabel="แจ้งเตือนโปรโมชัน"
            />
            <Text style={styles.rowLabel}>รับการแจ้งเตือนโปรโมชัน</Text>
          </PressableScale>

          <PressableScale style={styles.linkRow} onPress={onClearCache}>
            <Text style={styles.linkText}>ล้างแคช</Text>
          </PressableScale>

          <PressableScale style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </PressableScale>
        </ScrollView>
        <ConfirmModal
          visible={clearCacheVisible}
          title="ล้างแคช"
          message="ล้างประวัติการค้นหาทั้งหมด?"
          confirmText="ล้าง"
          destructive
          onCancel={() => setClearCacheVisible(false)}
          onConfirm={onClearCacheConfirm}
        />
      </RequireAuth>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surface,
  },
  chipSelected: {
    backgroundColor: Brand.accent,
  },
  chipText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  chipTextSelected: {
    color: Brand.onAccent,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  linkRow: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.successText,
  },
  logoutButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radius.pill,
    backgroundColor: Brand.favoriteBg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.danger,
  },
});
