import { useRouter } from 'expo-router';
import { Leaf, Search } from 'lucide-react-native';
import { useCallback } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/shop/category-icon';
import { ProductCard } from '@/components/shop/product-card';
import { SectionHeader } from '@/components/shop/section-header';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useCountdown } from '@/hooks/use-countdown';
import { useCatalog } from '@/store/catalog-store';
import { Product } from '@/types/product';
import { formatCountdown } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const countdown = useCountdown(3 * 3600 + 23);
  const { categories, flashSaleProducts, recommendedProducts } = useCatalog();

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
        hasNotification
        onSettings={() => {}}
        onNotification={() => {}}
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
            <Pressable
              style={styles.search}
              onPress={() => router.push('/products?title=ค้นหาสินค้า')}>
              <Search size={18} color={Brand.textMuted} strokeWidth={2} />
              <Text style={styles.searchPlaceholder}>ค้นหาสินค้าเครื่องใช้ไฟฟ้า</Text>
            </Pressable>

            {/* Promo banner */}
            <View style={styles.banner}>
              <View style={styles.bannerIcon}>
                <Leaf size={22} color={Brand.successText} strokeWidth={2} />
              </View>
              <View style={styles.bannerBody}>
                <Text style={styles.bannerTitle}>
                  ค่าส่งถูกลง <Text style={styles.bannerPercent}>30%</Text>
                </Text>
                <Text style={styles.bannerSub}>สำหรับสินค้าชิ้นใหญ่</Text>
              </View>
            </View>

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
                {categories.map((cat) => (
                  <CategoryIcon
                    key={cat.id}
                    name={cat.icon}
                    label={cat.name}
                    onPress={() =>
                      router.push(`/products?category=${cat.id}&title=${cat.name}`)
                    }
                  />
                ))}
              </ScrollView>
            </View>

            {/* Flash sale */}
            <View style={styles.section}>
              <SectionHeader title="ลดกระหน่ำ" badge={formatCountdown(countdown)} />
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
            </View>

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
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Brand.textMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Brand.successBg,
    borderRadius: Radius.card,
    padding: 16,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBody: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.successText,
  },
  bannerPercent: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 12,
    color: Brand.successText,
  },
  section: {
    gap: 14,
  },
  categoryRail: {
    gap: 16,
    paddingRight: 8,
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
