import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/shop/badge';
import { Checkbox } from '@/components/shop/checkbox';
import { ConfirmModal } from '@/components/shop/confirm-modal';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useThemeMode } from '@/store/theme-store';
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
  const styles = useStyles(makeStyles);
  const { mode: theme, setMode } = useThemeMode();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, updateSettings } = useAuth();
  const { showToast } = useToast();

  const language = user?.settings.language ?? 'th';
  const notifyPromo = user?.settings.notifyPromo ?? true;
  const [clearCacheVisible, setClearCacheVisible] = useState(false);

  const saveTheme = (value: typeof theme) => {
    setMode(value);
    updateSettings({ theme: value });
  };
  const saveLanguage = (value: typeof language) => {
    updateSettings({ language: value });
  };
  const saveNotifyPromo = (value: boolean) => {
    updateSettings({ notifyPromo: value });
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
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>ภาษา</Text>
              <Badge label="เร็วๆ นี้" tone="neutral" />
            </View>
            <View style={[styles.chipRow, styles.languageRow]}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={language === opt.value}
                  onPress={() => saveLanguage(opt.value)}
                  disabled
                />
              ))}
            </View>
          </View>

          <PressableScale
            accessibilityRole="button"
            style={styles.row}
            onPress={() => saveNotifyPromo(!notifyPromo)}>
            <Checkbox
              checked={notifyPromo}
              onToggle={() => saveNotifyPromo(!notifyPromo)}
              accessibilityLabel="แจ้งเตือนโปรโมชัน"
            />
            <Text style={styles.rowLabel}>รับการแจ้งเตือนโปรโมชัน</Text>
          </PressableScale>

          <PressableScale
            accessibilityRole="button"
            style={styles.linkRow}
            onPress={onClearCache}>
            <Text style={styles.linkText}>ล้างแคช</Text>
          </PressableScale>

          <PressableScale
            accessibilityRole="button"
            style={styles.logoutButton}
            onPress={onLogout}>
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
  disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles(makeStyles);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`เลือก ${label}`}
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </PressableScale>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageRow: {
    opacity: 0.5,
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
