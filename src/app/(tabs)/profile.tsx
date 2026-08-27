import { useFocusEffect, useRouter } from 'expo-router';
import {
  ChevronRight,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { couponsApi } from '@/api/coupons';
import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { PixelBorder, PixelFonts, PixelShadow, Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useShop } from '@/store/shop-store';
import { useBrand } from '@/store/theme-store';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: '/orders' | '/addresses' | '/coupons' | '/(tabs)/favorites' | '/settings' | '/admin/products';
}

export default function ProfileScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token, logout, isGuest, isAuthenticated, isAdminSession, exitGuestMode } = useAuth();
  const { favorites } = useShop();
  const [couponCount, setCouponCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setCouponCount(null);
        return;
      }

      let cancelled = false;
      setCouponCount(null);
      couponsApi
        .list(token)
        .then((coupons) => {
          if (!cancelled) setCouponCount(coupons.length);
        })
        .catch(() => {
          if (!cancelled) setCouponCount(null);
        });

      return () => {
        cancelled = true;
      };
    }, [token])
  );

  const menu: MenuItem[] = [
    { icon: Package, label: 'คำสั่งซื้อของฉัน', href: '/orders' },
    { icon: MapPin, label: 'ที่อยู่จัดส่ง', href: '/addresses' },
    { icon: Ticket, label: 'คูปองส่วนลด', href: '/coupons' },
    { icon: Heart, label: 'รายการโปรด', href: '/(tabs)/favorites' },
    { icon: Settings, label: 'ตั้งค่า', href: '/settings' },
    ...(isAdminSession
      ? [{ icon: ShieldCheck, label: 'จัดการสินค้า', href: '/admin/products' } as MenuItem]
      : []),
  ];

  const onLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const onSwitchToAdmin = async () => {
    await logout();
    router.replace('/(auth)/login?intent=admin');
  };

  if (isGuest && !isAuthenticated) {
    return (
      <View style={styles.screen}>
        <TopBar variant="list" title="โปรไฟล์" />
        <View style={[styles.guestContent, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.guestIcon}>
            <LogIn size={30} color={Brand.text} strokeWidth={2} />
          </View>
          <Text style={styles.guestTitle}>คุณกำลังเข้าชมแบบผู้เยี่ยมชม</Text>
          <Text style={styles.guestDescription}>
            เข้าสู่ระบบเพื่อใช้งานโปรไฟล์และฟีเจอร์สำหรับสมาชิก
          </Text>
          <View style={styles.guestActions}>
            <PressableScale
              accessibilityRole="button"
              style={[styles.guestButton, styles.guestPrimaryButton]}
              onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.guestPrimaryText}>เข้าสู่ระบบ</Text>
            </PressableScale>
            <PressableScale
              accessibilityRole="button"
              style={[styles.guestButton, styles.guestSecondaryButton]}
              onPress={exitGuestMode}>
              <Text style={styles.guestSecondaryText}>ออกจากโหมดผู้เยี่ยมชม</Text>
            </PressableScale>
          </View>
        </View>
      </View>
    );
  }

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

          {/* Stats row — รายการโปรดและคูปองใช้ข้อมูลจริง ส่วนเหรียญยังเป็นค่าตกแต่ง */}
          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <View style={[styles.statDot, { backgroundColor: Brand.coin }]} />
              {/* TODO(fake-data): ค่าตกแต่งชั่วคราวจนกว่า backend จะมีระบบแต้ม/เหรียญ */}
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
              <Text style={styles.statValue}>
                {couponCount === null ? '--' : String(couponCount).padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>คูปอง</Text>
            </View>
          </View>

          {/* Menu */}
          <PixelPanel style={styles.menu} shadowOffset={PixelShadow.md}>
            {menu.map((item, index) => {
              const Icon = item.icon;
              return (
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`เปิดหน้า ${item.label}`}
                  key={item.label}
                  onPress={() => router.push(item.href)}
                  style={[styles.menuRow, index < menu.length - 1 && styles.menuDivider]}>
                  <Icon size={20} color={Brand.text} strokeWidth={1.75} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <ChevronRight size={18} color={Brand.textMuted} strokeWidth={2} />
                </PressableScale>
              );
            })}
          </PixelPanel>

          {user?.isAdmin && !isAdminSession ? (
            <PressableScale
              accessibilityRole="button"
              style={styles.adminModeHint}
              onPress={onSwitchToAdmin}>
              <Text style={styles.adminModeHintText}>
                คุณเข้าสู่ระบบในโหมดลูกค้า · สลับไปโหมดแอดมิน
              </Text>
            </PressableScale>
          ) : null}

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

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  guestContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.tan,
    borderRadius: Radius.lg,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    marginBottom: 18,
  },
  guestTitle: {
    fontSize: 18,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
    textAlign: 'center',
  },
  guestDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
  guestActions: {
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radius.pill,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  guestPrimaryButton: {
    backgroundColor: Brand.accent,
  },
  guestSecondaryButton: {
    backgroundColor: Brand.surface,
  },
  guestPrimaryText: {
    fontSize: 15,
    fontFamily: PixelFonts.headingBold,
    color: Brand.onAccent,
  },
  guestSecondaryText: {
    fontSize: 15,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
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
  adminModeHint: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  adminModeHintText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
    textAlign: 'center',
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
