import { useFocusEffect, useRouter } from 'expo-router';
import { Leaf, Search } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { notificationsApi } from '@/api/notifications';
import { CategoryIcon } from '@/components/shop/category-icon';
import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { ProductCard } from '@/components/shop/product-card';
import { SectionHeader } from '@/components/shop/section-header';
import { TopBar } from '@/components/shop/top-bar';
import { PixelBorder, PixelFonts, PixelShadow, Radius, type BrandPalette } from '@/constants/theme';
import { useCountdown } from '@/hooks/use-countdown';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useCatalog } from '@/store/catalog-store';
import { useBrand } from '@/store/theme-store';
import { Product } from '@/types/product';
import { formatCountdown } from '@/utils/format';

/**
 * หน้าแรก (แท็บที่ 1)
 *
 * ประกอบด้วย: หัวข้อที่อยู่จัดส่ง · แถบค้นหา · แบนเนอร์ · หมวดหมู่ · Flash Sale · สินค้าแนะนำ
 * สินค้ามาจาก catalog-store (API → GitHub → ไฟล์ในแอป) ส่วนที่อยู่/แจ้งเตือนยิง API ตรง
 */
export default function HomeScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // TODO(fake-data): ค่าตกแต่งชั่วคราวจนกว่า backend จะมีเวลาจบ Flash Sale
  const countdown = useCountdown(3 * 3600 + 23);
  const { categories, flashSaleProducts, recommendedProducts, loading, refresh } = useCatalog();
  const { token, user } = useAuth();
  const notifyPromo = user?.settings.notifyPromo ?? true;
  const [hasUnread, setHasUnread] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('ยังไม่ได้ตั้งที่อยู่จัดส่ง');
  const [refreshing, setRefreshing] = useState(false);
  const refreshStarted = useRef(false);

  /** โหลดข้อมูลส่วนหัว: ที่อยู่จัดส่ง + จุดแดงแจ้งเตือน (เฉพาะตอนล็อกอินแล้ว) */
  const loadHeaderData = useCallback(async () => {
    if (!token) {
      setHasUnread(false);
      setDeliveryAddress('ยังไม่ได้ตั้งที่อยู่จัดส่ง');
      return;
    }
    // ยิง 2 API พร้อมกัน และใส่ .catch แยกในแต่ละตัว
    // → ถ้าตัวใดตัวหนึ่งล้ม อีกตัวยังทำงานต่อได้ (ถ้า catch รวมทีเดียวจะพังทั้งคู่)
    const [notifications, addresses] = await Promise.all([
      notificationsApi.list(token).catch(() => []),
      addressesApi.list(token).catch(() => []),
    ]);
    // ถ้าผู้ใช้ปิดแจ้งเตือนโปรโมชันไว้ ไม่ต้องนับ notification ประเภท promo เป็นของที่ยังไม่อ่าน
    setHasUnread(notifications.some(
      (notification) => !notification.isRead && (notifyPromo || notification.type !== 'promo')
    ));
    // ใช้ที่อยู่ที่ตั้งเป็นค่าเริ่มต้น ถ้าไม่มีก็เอาที่อยู่แรกในลิสต์
    const address = addresses.find((item) => item.isDefault) ?? addresses[0];
    setDeliveryAddress(address?.line1 ?? 'ยังไม่ได้ตั้งที่อยู่จัดส่ง');
  }, [notifyPromo, token]);

  // useFocusEffect (ไม่ใช่ useEffect) → โหลดใหม่ทุกครั้งที่กลับเข้าหน้านี้
  // เช่นไปเพิ่มที่อยู่มาแล้วกดย้อนกลับ ที่อยู่บนหัวจะอัปเดตทันที
  useFocusEffect(
    useCallback(() => {
      void loadHeaderData();
    }, [loadHeaderData])
  );

  // ปิดสปินเนอร์ pull-to-refresh เมื่อ catalog-store โหลดเสร็จ
  // ต้องรอให้เห็น loading = true ก่อน (refreshStarted) แล้วค่อยรอให้กลับเป็น false
  // ไม่งั้นสปินเนอร์จะแวบหายทันทีทั้งที่ยังโหลดไม่เสร็จ
  // (refresh() ของ catalog-store ไม่คืน Promise จึง await ไม่ได้)
  useEffect(() => {
    if (!refreshing) return;
    if (loading) {
      refreshStarted.current = true;
    } else if (refreshStarted.current) {
      refreshStarted.current = false;
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  /** ลากลงเพื่อรีเฟรช — โหลดทั้งสินค้าและข้อมูลส่วนหัวใหม่ */
  const onRefresh = useCallback(() => {
    refreshStarted.current = false;
    setRefreshing(true);
    refresh();
    void loadHeaderData();
  }, [loadHeaderData, refresh]);

  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard product={item} index={index} />
    ),
    []
  );

  return (
    <View style={styles.screen}>
      <TopBar
        variant="home"
        address={deliveryAddress}
        hasNotification={hasUnread}
        onAddressPress={() => router.push('/addresses')}
        onSettings={() => router.push('/settings')}
        onNotification={() => router.push('/notifications')}
      />

      <FlatList
        data={recommendedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Brand.text}
            colors={[Brand.text]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Search bar */}
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="ค้นหาสินค้า"
              style={styles.search}
              pixelShadow={PixelShadow.sm}
              /*function เอาไว้ serach product  router เอาไว้ serach */
              onPress={() => router.push('/search')}>
              <Search size={18} color={Brand.textMuted} strokeWidth={2.5} />
              <Text style={styles.searchPlaceholder}>ค้นหาสินค้าเครื่องใช้ไฟฟ้า</Text>
            </PressableScale>

            {/* Promo banner */}
            <PixelPanel backgroundColor={Brand.mint} shadowOffset={PixelShadow.md} style={styles.banner}>
              <View style={styles.bannerIcon}>
                <Leaf size={20} color={Brand.text} strokeWidth={2.5} />
              </View>
              <View style={styles.bannerBody}>
                <Text style={styles.bannerTitle}>
                  ค่าส่งถูกลง <Text style={styles.bannerPercent}>30%</Text>
                </Text>
                <Text style={styles.bannerSub}>สำหรับสินค้าชิ้นใหญ่</Text>
              </View>
            </PixelPanel>

            {/* Categories */}
            <View style={styles.section}>
              <SectionHeader
                title="หมวดหมู่"
                onSeeAll={() => router.push('/(tabs)/catalog')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRail}>
                {categories.map((cat, index) => (
                  <CategoryIcon
                    key={cat.id}
                    name={cat.icon}
                    label={cat.name}
                    paletteIndex={index}
                    onPress={() =>
                      router.push(`/products?category=${cat.id}&title=${cat.name}`)
                    }
                  />
                ))}
              </ScrollView>
            </View>

            {/* Flash sale */}
            <PixelPanel
              backgroundColor={Brand.saleBg}
              shadowOffset={PixelShadow.md}
              style={styles.flashPanel}>
              <View style={styles.flashHeaderRow}>
                <Text style={styles.flashTitle}>FLASH QUEST</Text>
                <View style={styles.flashCountdown}>
                  <Text style={styles.flashCountdownText}>{formatCountdown(countdown)}</Text>
                </View>
              </View>
              <Text style={styles.flashSubtitle}>ลดกระหน่ำ</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flashRail}>
                {flashSaleProducts.map((item, index) => (
                  <View key={item.id} style={styles.flashItem}>
                    <ProductCard product={item} index={index} />
                  </View>
                ))}
              </ScrollView>
            </PixelPanel>

            {/* Recommended header */}
            <View style={styles.recommendedHeader}>
              <SectionHeader title="แนะนำสำหรับคุณ" />
            </View>
          </View>
        }
      />
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
  },
  header: {
    gap: 20,
    paddingTop: 4,
  },
  column: {
    gap: 12,
    marginBottom: 12,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 13,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    backgroundColor: Brand.surface,
    borderWidth: 2,
    borderColor: Brand.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBody: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 14,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  bannerPercent: {
    fontSize: 15,
    fontFamily: PixelFonts.pixel,
  },
  bannerSub: {
    fontSize: 11,
    fontFamily: PixelFonts.bodyMedium,
    color: Brand.text,
  },
  section: {
    gap: 14,
  },
  categoryRail: {
    gap: 14,
    paddingRight: 8,
  },
  flashPanel: {
    padding: 12,
    gap: 10,
  },
  flashHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flashTitle: {
    fontSize: 11,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  flashSubtitle: {
    fontSize: 15,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
    marginTop: -6,
  },
  flashCountdown: {
    backgroundColor: Brand.divider,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  flashCountdownText: {
    fontSize: 11,
    fontFamily: PixelFonts.pixel,
    color: Brand.saleBg,
  },
  flashRail: {
    gap: 12,
    paddingRight: 8,
  },
  flashItem: {
    width: 160,
  },
  recommendedHeader: {
    marginTop: -4,
  },
});
