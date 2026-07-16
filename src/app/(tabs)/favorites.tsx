import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/shop/pressable-scale';
import { ProductCard } from '@/components/shop/product-card';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useCatalog } from '@/store/catalog-store';
import { useShop } from '@/store/shop-store';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites } = useShop();
  const { products } = useCatalog();

  const favoriteProducts = useMemo(
    () => products.filter((p) => favorites.has(p.id)),
    [products, favorites]
  );

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="รายการโปรด" />

      {favoriteProducts.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Heart size={32} color={Brand.favoriteIcon} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>ยังไม่มีรายการโปรด</Text>
          <Text style={styles.emptySub}>กดหัวใจที่สินค้าเพื่อบันทึกไว้ที่นี่</Text>
          <PressableScale
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)')}>
            <Text style={styles.browseText}>เลือกซื้อสินค้า</Text>
          </PressableScale>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  column: {
    gap: 12,
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.favoriteBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  emptySub: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 16,
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  browseText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
