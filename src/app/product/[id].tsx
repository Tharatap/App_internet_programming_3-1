import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  Info,
  Ruler,
  ShieldCheck,
  Star,
  Truck,
  X,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/shop/badge';
import { PressableScale } from '@/components/shop/pressable-scale';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { FloatingHeader } from '@/components/shop/top-bar';
import { AppFrameWidth, Brand, Radius } from '@/constants/theme';
import { useCatalog } from '@/store/catalog-store';
import { useShop } from '@/store/shop-store';
import { formatBaht } from '@/utils/format';

// Gallery page width follows the device width, but is capped to the app frame
// width on web so images don't overflow the centered column.
const windowWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(windowWidth, AppFrameWidth) : windowWidth;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useShop();
  const { getProductById } = useCatalog();
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const product = getProductById(id);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>ไม่พบสินค้า</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>ย้อนกลับ</Text>
        </Pressable>
      </View>
    );
  }

  // Gallery pages follow the number of real images (at least 1 grey placeholder).
  const galleryPages = Math.max(product.images.length, 1);

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.screen}>
      <FloatingHeader productId={product.id} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Image gallery */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}>
            {Array.from({ length: galleryPages }).map((_, i) => (
              <SkeletonImage key={i} uri={product.images[i]} style={styles.galleryImage} />
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {Array.from({ length: galleryPages }).map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating + energy badges */}
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Star size={13} color="#F5A623" fill="#F5A623" strokeWidth={0} />
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviewCount})
              </Text>
            </View>
            {product.energySavingPercent ? (
              <Badge label={`ประหยัดไฟ ${product.energySavingPercent}%`} tone="success" />
            ) : null}
          </View>

          {/* Price card */}
          <View style={styles.priceCard}>
            <View style={styles.priceCardLeft}>
              <View style={styles.priceLine}>
                <Text style={styles.price}>{formatBaht(product.price)}</Text>
                {product.originalPrice ? (
                  <Text style={styles.originalPrice}>{formatBaht(product.originalPrice)}</Text>
                ) : null}
              </View>
              {product.installmentPerMonth ? (
                <Text style={styles.installment}>
                  ผ่อน {formatBaht(product.installmentPerMonth)}/เดือน
                </Text>
              ) : null}
            </View>
            <Pressable hitSlop={8} accessibilityLabel="ข้อมูลการผ่อนชำระ">
              <Info size={20} color={Brand.textMuted} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
            {product.description}
          </Text>
          <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
            <Text style={styles.readMore}>{expanded ? 'ย่อลง' : 'อ่านเพิ่มเติม'}</Text>
          </Pressable>

          {/* Specs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สเปคสินค้า</Text>
            <SpecRow
              icon={<Zap size={18} color={Brand.textSecondary} strokeWidth={2} />}
              label="กำลังไฟ"
              value={product.specs.power}
            />
            <SpecRow
              icon={<Ruler size={18} color={Brand.textSecondary} strokeWidth={2} />}
              label="ขนาดที่เหมาะสม"
              value={product.specs.suitableRoom}
            />
            <SpecRow
              icon={<ShieldCheck size={18} color={Brand.textSecondary} strokeWidth={2} />}
              label="การรับประกัน"
              value={product.specs.warranty}
            />
          </View>

          {/* Branch stock */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สต๊อกตามสาขา</Text>
            {product.branchStock.map((branch) => (
              <View key={branch.id} style={styles.branchRow}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <View style={styles.branchStatus}>
                  {branch.inStock ? (
                    <>
                      <Check size={16} color={Brand.successText} strokeWidth={2.5} />
                      <Text style={[styles.branchLabel, { color: Brand.successText }]}>
                        มีสินค้า
                      </Text>
                    </>
                  ) : (
                    <>
                      <X size={16} color={Brand.danger} strokeWidth={2.5} />
                      <Text style={[styles.branchLabel, { color: Brand.danger }]}>หมด</Text>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky add-to-cart */}
      <View style={[styles.sticky, { paddingBottom: insets.bottom + 12 }]}>
        <PressableScale
          style={[styles.cartButton, !product.inStock && styles.cartButtonDisabled]}
          onPress={() => {
            if (product.inStock) {
              addToCart(product);
              router.push('/(tabs)/cart');
            }
          }}>
          <Text style={styles.cartButtonText}>
            {product.inStock ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
          </Text>
        </PressableScale>
        <View style={styles.deliveryRow}>
          <Truck size={13} color={Brand.textSecondary} strokeWidth={2} />
          <Text style={styles.deliveryText}>จัดส่งวันที่ 26 ก.ค.</Text>
        </View>
      </View>
    </View>
  );
}

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.specRow}>
      <View style={styles.specLabel}>
        {icon}
        <Text style={styles.specLabelText}>{label}</Text>
      </View>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Brand.background,
  },
  notFoundText: { fontSize: 16, color: Brand.text },
  backLink: { fontSize: 14, color: Brand.successText, fontWeight: '600' },
  galleryImage: {
    width,
    height: width,
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Brand.text,
  },
  body: {
    padding: 20,
    gap: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.text,
    lineHeight: 27,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.text,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 16,
  },
  priceCardLeft: {
    gap: 4,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Brand.text,
  },
  originalPrice: {
    fontSize: 14,
    color: Brand.textMuted,
    textDecorationLine: 'line-through',
  },
  installment: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Brand.textSecondary,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.successText,
    marginTop: -6,
  },
  section: {
    gap: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specLabelText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchName: {
    fontSize: 14,
    color: Brand.text,
  },
  branchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Brand.background,
    borderTopColor: Brand.divider,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 6,
  },
  cartButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cartButtonDisabled: {
    backgroundColor: Brand.surfaceDeep,
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deliveryText: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
});
