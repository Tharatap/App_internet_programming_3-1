import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: '/orders' | '/addresses' | '/coupons' | '/(tabs)/favorites' | '/settings';
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menu: MenuItem[] = [
    { icon: Package, label: 'คำสั่งซื้อของฉัน', href: '/orders' },
    { icon: MapPin, label: 'ที่อยู่จัดส่ง', href: '/addresses' },
    { icon: Ticket, label: 'คูปองส่วนลด', href: '/coupons' },
    { icon: Heart, label: 'รายการโปรด', href: '/(tabs)/favorites' },
    { icon: Settings, label: 'ตั้งค่า', href: '/settings' },
  ];

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="โปรไฟล์" />
      <RequireAuth title="โปรไฟล์">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          {/* User card */}
          <View style={styles.userCard}>
            <SkeletonImage uri={user?.avatarUrl ?? undefined} style={styles.avatar} borderRadius={30} />
            <View style={styles.userBody}>
              <Text style={styles.userName}>{user?.name ?? ''}</Text>
              <Text style={styles.userSub}>{user?.email ?? ''}</Text>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.menu}>
            {menu.map((item, index) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => router.push(item.href)}
                  style={[styles.menuRow, index < menu.length - 1 && styles.menuDivider]}>
                  <Icon size={20} color={Brand.text} strokeWidth={1.75} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <ChevronRight size={18} color={Brand.textMuted} strokeWidth={2} />
                </Pressable>
              );
            })}
          </View>

          <PressableScale
            style={styles.logoutButton}
            onPress={onLogout}
            accessibilityLabel="ออกจากระบบ">
            <LogOut size={18} color={Brand.danger} strokeWidth={2} />
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </PressableScale>
        </ScrollView>
      </RequireAuth>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  userBody: {
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.text,
  },
  userSub: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  menu: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Brand.divider,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Brand.danger,
  },
});
