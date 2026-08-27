import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/shop/product-card';
import { PressableScale } from '@/components/shop/pressable-scale';
import { TopBar } from '@/components/shop/top-bar';
import {
  defaultFilterValue,
  FilterSheet,
  FilterValue,
} from '@/components/shop/filter-sheet';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useCatalog } from '@/store/catalog-store';
import { useBrand } from '@/store/theme-store';
import { Product } from '@/types/product';

const FILTERS = ['แนะนำ', 'ราคาต่ำ-สูง', 'ยี่ห้อ', 'ประหยัดไฟ'] as const;
type Filter = (typeof FILTERS)[number];

const PRICE_BOUNDS: Record<FilterValue['priceRange'], [number, number]> = {
  all: [0, Infinity],
  under1000: [0, 1000],
  '1000to5000': [1000, 5000],
  '5000to10000': [5000, 10000],
  over10000: [10000, Infinity],
};

export default function ProductListScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const { category, title } = useLocalSearchParams<{ category?: string; title?: string }>();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<Filter>('แนะนำ');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState<FilterValue>(defaultFilterValue);
  const [refreshing, setRefreshing] = useState(false);
  const refreshStarted = useRef(false);
  const { products: allProducts, getProductsByCategory, loading, refresh } = useCatalog();

  useEffect(() => {
    if (!refreshing) return;
    if (loading) {
      refreshStarted.current = true;
    } else if (refreshStarted.current) {
      refreshStarted.current = false;
      setRefreshing(false);
    }
  }, [loading, refreshing]);

  const onRefresh = () => {
    refreshStarted.current = false;
    setRefreshing(true);
    refresh();
  };

  const categoryProducts = useMemo(
    () => (category ? getProductsByCategory(category) : allProducts),
    [category, allProducts, getProductsByCategory]
  );

  const brands = useMemo(
    () =>
      Array.from(new Set(categoryProducts.map((p) => p.brand).filter((b): b is string => !!b))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [categoryProducts]
  );

  const filteredProducts = useMemo(() => {
    const [min, max] = PRICE_BOUNDS[filter.priceRange];
    return categoryProducts.filter((p) => {
      if (filter.brand && p.brand !== filter.brand) return false;
      if (p.price < min || p.price > max) return false;
      if (filter.energyMin > 0 && (p.energySavingPercent ?? 0) < filter.energyMin) return false;
      if (filter.inStockOnly && !p.inStock) return false;
      return true;
    });
  }, [categoryProducts, filter]);

  const products = useMemo<Product[]>(() => {
    const list = [...filteredProducts];
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
  }, [filteredProducts, active]);

  const activeFilterCount =
    (filter.brand ? 1 : 0) +
    (filter.priceRange !== 'all' ? 1 : 0) +
    (filter.energyMin > 0 ? 1 : 0) +
    (filter.inStockOnly ? 1 : 0);

  return (
    <View style={styles.screen}>
      <TopBar
        variant="list"
        title={title ?? 'สินค้าทั้งหมด'}
        showBack
        showFilter
        onFilter={() => setFilterVisible(true)}
      />

      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {FILTERS.map((filterOption) => {
            const selected = filterOption === active;
            return (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`เรียงสินค้าตาม ${filterOption}`}
                key={filterOption}
                onPress={() => setActive(filterOption)}
                style={[styles.chip, selected && styles.chipSelected]}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {filterOption}
                </Text>
              </PressableScale>
            );
          })}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="เปิดตัวกรองสินค้า"
            onPress={() => setFilterVisible(true)}
            style={[styles.chip, activeFilterCount > 0 && styles.chipSelected]}>
            <Text
              style={[styles.chipText, activeFilterCount > 0 && styles.chipTextSelected]}>
              ตัวกรอง{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </PressableScale>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Brand.text}
            colors={[Brand.text]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>ไม่พบสินค้าที่ตรงกับตัวกรอง</Text>
        }
      />

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        brands={brands}
        value={filter}
        onChange={setFilter}
        resultCount={products.length}
      />
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
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
