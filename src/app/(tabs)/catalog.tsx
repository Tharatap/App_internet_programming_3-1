import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/shop/category-icon';
import { ProductCard } from '@/components/shop/product-card';
import { SectionHeader } from '@/components/shop/section-header';
import { TopBar } from '@/components/shop/top-bar';
import { Brand } from '@/constants/theme';
import { useCatalog } from '@/store/catalog-store';

export default function CatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, categories } = useCatalog();
  const popular = products.slice(0, 4);

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="หมวดหมู่" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <CategoryIcon
              key={cat.id}
              name={cat.icon}
              label={cat.name}
              onPress={() => router.push(`/products?category=${cat.id}&title=${cat.name}`)}
            />
          ))}
        </View>

        <SectionHeader
          title="สินค้ายอดนิยม"
          onSeeAll={() => router.push('/products?title=สินค้าทั้งหมด')}
        />
        <View style={styles.productGrid}>
          {popular.map((product, index) => (
            <View key={product.id} style={styles.productCell}>
              <ProductCard product={product} index={index} />
            </View>
          ))}
        </View>
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
    justifyContent: 'space-between',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCell: {
    width: '48%',
    flexGrow: 1,
  },
});
