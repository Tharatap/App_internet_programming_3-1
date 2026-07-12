import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge } from '@/components/shop/badge';
import { HeartButton } from '@/components/shop/heart-button';
import { PressableScale } from '@/components/shop/pressable-scale';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { Brand, Radius } from '@/constants/theme';
import { Product } from '@/types/product';
import { formatBaht } from '@/utils/format';

interface Props {
  product: Product;
  variant?: 'grid' | 'row';
  /** Stagger index for the entrance animation. */
  index?: number;
}

/** Reusable product card. `grid` = tall 2-column card, `row` = horizontal list. */
export function ProductCard({ product, variant = 'grid', index = 0 }: Props) {
  const router = useRouter();
  const open = () => router.push(`/product/${product.id}`);
  const entering = FadeInDown.duration(300).delay(Math.min(index, 8) * 60);

  if (variant === 'row') {
    return (
      <Animated.View entering={entering}>
        <PressableScale
          onPress={open}
          style={[styles.rowCard, !product.inStock && styles.dimmed]}>
          <SkeletonImage
            uri={product.images[0]}
            style={styles.rowImage}
            borderRadius={Radius.md}
          />
          <View style={styles.rowBody}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.badgeRow}>
              {product.energySavingPercent ? (
                <Badge label="ประหยัดไฟเบอร์ 5" tone="success" />
              ) : null}
              {!product.inStock ? <Badge label="สินค้าหมด" tone="danger" /> : null}
            </View>
            <PriceRow product={product} />
          </View>
          <View style={styles.rowHeart}>
            <HeartButton productId={product.id} size={18} />
          </View>
        </PressableScale>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={entering} style={styles.gridWrapper}>
      <PressableScale
        onPress={open}
        style={[styles.gridCard, !product.inStock && styles.dimmed]}>
        <View>
          <SkeletonImage
            uri={product.images[0]}
            style={styles.gridImage}
            borderRadius={Radius.md}
          />
          <View style={styles.gridHeart}>
            <HeartButton productId={product.id} size={18} />
          </View>
          {!product.inStock ? (
            <View style={styles.outOfStock}>
              <Badge label="สินค้าหมด" tone="danger" />
            </View>
          ) : null}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <PriceRow product={product} />
      </PressableScale>
    </Animated.View>
  );
}

function PriceRow({ product }: { product: Product }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.price}>{formatBaht(product.price)}</Text>
      {product.originalPrice ? (
        <Text style={styles.originalPrice}>{formatBaht(product.originalPrice)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dimmed: { opacity: 0.55 },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: Brand.text,
    lineHeight: 19,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  originalPrice: {
    fontSize: 12,
    color: Brand.textMuted,
    textDecorationLine: 'line-through',
  },
  // Grid
  gridWrapper: { flex: 1 },
  gridCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 10,
    gap: 8,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
  },
  gridHeart: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  outOfStock: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  // Row
  rowCard: {
    flexDirection: 'row',
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  rowImage: {
    width: 88,
    height: 88,
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  rowHeart: {
    alignSelf: 'flex-start',
  },
});
