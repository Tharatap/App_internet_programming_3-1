import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, PixelBorder, PixelFonts, PixelShadow } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { useShop } from '@/store/shop-store';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: '/orders' | '/addresses' | '/coupons' | '/(tabs)/favorites' | '/settings' | '/admin/products';
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favorites } = useShop();

  const menu: MenuItem[] = [
    { icon: Package, label: 'คำสั่งซื้อของฉัน', href: '/orders' },
    { icon: MapPin, label: 'ที่อยู่จัดส่ง', href: '/addresses' },
    { icon: Ticket, label: 'คูปองส่วนลด', href: '/coupons' },
    { icon: Heart, label: 'รายการโปรด', href: '/(tabs)/favorites' },
    { icon: Settings, label: 'ตั้งค่า', href: '/settings' },
    ...(user?.isAdmin
      ? [{ icon: ShieldCheck, label: 'จัดการสินค้า', href: '/admin/products' } as MenuItem]
      : []),
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
          <PixelPanel style={styles.userCard}>
            <SkeletonImage uri={user?.avatarUrl ?? undefined} style={styles.avatar} borderRadius={0} />
            <View style={styles.userBody}>
              <Text style={styles.userName}>{user?.name ?? ''}</Text>
              <Text style={styles.userSub}>{user?.email ?? ''}</Text>
            </View>
          </PixelPanel>

          {/* Stats row — "รายการโปรด" is real; the coin/coupon counts are decorative
              placeholders (no loyalty-points backend exists), matching the pixel
              mockup's game-like stat tiles without implying real functionality. */}
          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <View style={[styles.statDot, { backgroundColor: Brand.coin }]} />
              <Text style={styles.statValue}>1,240</Text>
              <Text style={styles.statLabel}>เหรียญ</Text>
            </View>
            <View style={styles.statTile}>
              <Heart size={18} color={Brand.favoriteIcon} strokeWidth={2} fill={Brand.favoriteIcon} />
              <Text style={styles.statValue}>{favorites.size}</Text>
              <Text style={styles.statLabel}>ของโปรด</Text>
            </View>
            <View style={styles.statTile}>
              <View style={[styles.statDot, { backgroundColor: Brand.successBg }]} />
              <Text style={styles.statValue}>02</Text>
              <Text style={styles.statLabel}>คูปอง</Text>
            </View>
          </View>

          {/* Menu */}
          <PixelPanel style={styles.menu} shadowOffset={PixelShadow.md}>
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
          </PixelPanel>

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
    fontSize: 16,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  userSub: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Brand.divider,
  },
  statValue: {
    fontSize: 11,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
  },
  menu: {
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  menuDivider: {
    borderBottomWidth: PixelBorder.thin,
    borderBottomColor: Brand.divider,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: PixelFonts.bodySemiBold,
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
    fontSize: 14,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.danger,
  },
});
