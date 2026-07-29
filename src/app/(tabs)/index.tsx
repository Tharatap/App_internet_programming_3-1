import { useFocusEffect, useRouter } from 'expo-router';
import { Leaf, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { notificationsApi } from '@/api/notifications';
import { CategoryIcon } from '@/components/shop/category-icon';
import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { ProductCard } from '@/components/shop/product-card';
import { SectionHeader } from '@/components/shop/section-header';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, PixelBorder, PixelFonts, PixelShadow, Radius } from '@/constants/theme';
import { useCountdown } from '@/hooks/use-countdown';
import { useAuth } from '@/store/auth-store';
import { useCatalog } from '@/store/catalog-store';
import { Product } from '@/types/product';
import { formatCountdown } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const countdown = useCountdown(3 * 3600 + 23);
  const { categories, flashSaleProducts, recommendedProducts } = useCatalog();
  const { token } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setHasUnread(false);
        return;
      }
      notificationsApi
        .list(token)
        .then((list) => setHasUnread(list.some((n) => !n.isRead)))
        .catch(() => {});
    }, [token])
  );

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
        address="92 ถ.สุขุมวิท กรุงเทพฯ"
        hasNotification={hasUnread}
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
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Search bar */}
            <PressableScale
              style={styles.search}
              pixelShadow={PixelShadow.sm}
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

const styles = StyleSheet.create({
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
