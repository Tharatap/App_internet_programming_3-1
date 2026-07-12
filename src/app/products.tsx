import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/shop/product-card';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { getProductsByCategory, mockProducts } from '@/data/mockProducts';
import { Product } from '@/types/product';

const FILTERS = ['แนะนำ', 'ราคาต่ำ-สูง', 'ยี่ห้อ', 'ประหยัดไฟ'] as const;
type Filter = (typeof FILTERS)[number];

export default function ProductListScreen() {
  const { category, title } = useLocalSearchParams<{ category?: string; title?: string }>();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<Filter>('แนะนำ');

  const products = useMemo<Product[]>(() => {
    const base = category ? getProductsByCategory(category) : mockProducts;
    const list = [...base];
    switch (active) {
      case 'ราคาต่ำ-สูง':
        return list.sort((a, b) => a.price - b.price);
      case 'ประหยัดไฟ':
        return list.sort(
          (a, b) => (b.energySavingPercent ?? 0) - (a.energySavingPercent ?? 0)
        );
      case 'ยี่ห้อ':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'th'));
      default:
        return list;
    }
  }, [category, active]);

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title={title ?? 'สินค้าทั้งหมด'} showBack showFilter />

      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {FILTERS.map((filter) => {
            const selected = filter === active;
            return (
              <Pressable
                key={filter}
                onPress={() => setActive(filter)}
                style={[styles.chip, selected && styles.chipSelected]}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ProductCard product={item} variant="row" index={index} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>ไม่พบสินค้าในหมวดนี้</Text>
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
  chipsWrapper: {
    paddingBottom: 12,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surface,
  },
  chipSelected: {
    backgroundColor: Brand.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Brand.textSecondary,
  },
  chipTextSelected: {
    color: Brand.onAccent,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: Brand.textSecondary,
  },
});
