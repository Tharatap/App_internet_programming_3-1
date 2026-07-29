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
  Modal,
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
import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { FloatingHeader } from '@/components/shop/top-bar';
import {
  AppFrameWidth,
  Brand,
  PixelBorder,
  PixelFonts,
  PixelShadow,
  Radius,
} from '@/constants/theme';
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
  const [infoVisible, setInfoVisible] = useState(false);

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
  // 5-segment energy bar, matching the mockup's "ENERGY" meter.
  const energySegments = product.energySavingPercent
    ? Math.max(1, Math.min(5, Math.round(product.energySavingPercent / 20)))
    : 0;

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.screen}>
      <FloatingHeader productId={product.id} productName={product.name} />

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
          <PixelPanel style={styles.priceCard}>
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
            <Pressable
              hitSlop={8}
              accessibilityLabel="ข้อมูลการผ่อนชำระ"
              onPress={() => setInfoVisible(true)}>
              <Info size={20} color={Brand.textMuted} strokeWidth={2} />
            </Pressable>
          </PixelPanel>

          {/* Energy meter */}
          {energySegments > 0 ? (
            <PixelPanel style={styles.energyCard}>
              <View style={styles.energyHeaderRow}>
                <Text style={styles.energyLabel}>ENERGY</Text>
                <Text style={styles.energyValue}>ประหยัดไฟ เบอร์ 5</Text>
              </View>
              <View style={styles.energyBar}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.energySegment, i < energySegments && styles.energySegmentFilled]}
                  />
                ))}
              </View>
            </PixelPanel>
          ) : null}

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
          pixelShadow={product.inStock ? PixelShadow.sm : undefined}
          onPress={() => {
            if (product.inStock) {
              addToCart(product);
              router.push('/(tabs)/cart');
            }
          }}>
          <Text style={styles.cartButtonText}>
            {product.inStock ? 'ADD TO CART' : 'สินค้าหมด'}
          </Text>
        </PressableScale>
        <View style={styles.deliveryRow}>
          <Truck size={13} color={Brand.textSecondary} strokeWidth={2} />
          <Text style={styles.deliveryText}>จัดส่งวันที่ 26 ก.ค.</Text>
        </View>
      </View>

      <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
        <Pressable style={styles.infoBackdrop} onPress={() => setInfoVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.infoCardWrapper}>
            <PixelPanel style={styles.infoCard}>
              <Text style={styles.infoTitle}>เงื่อนไขการผ่อนชำระ</Text>
              <Text style={styles.infoText}>
                ผ่อนชำระผ่านบัตรเครดิตของธนาคารที่ร่วมรายการ 0% นานสูงสุด 10 เดือน
                ยอดผ่อนต่อเดือนที่แสดงเป็นการประมาณการจากราคาสินค้าปัจจุบัน เงื่อนไขเป็นไปตามที่ธนาคารกำหนด
              </Text>
              <PressableScale
                style={styles.infoCloseButton}
                pixelShadow={PixelShadow.sm}
                onPress={() => setInfoVisible(false)}>
                <Text style={styles.infoCloseText}>เข้าใจแล้ว</Text>
              </PressableScale>
            </PixelPanel>
          </Pressable>
        </Pressable>
      </Modal>
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
  backLink: { fontSize: 14, color: Brand.successText, fontFamily: PixelFonts.headingBold },
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
    width: 8,
    height: 8,
    borderWidth: 2,
    borderColor: Brand.divider,
    backgroundColor: Brand.surface,
  },
  dotActive: {
    backgroundColor: Brand.text,
  },
  body: {
    padding: 20,
    gap: 14,
  },
  name: {
    fontSize: 18,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
    lineHeight: 25,
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
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  originalPrice: {
    fontSize: 13,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textMuted,
    textDecorationLine: 'line-through',
  },
  installment: {
    fontSize: 11,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  energyCard: {
    padding: 12,
    gap: 8,
  },
  energyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  energyLabel: {
    fontSize: 9,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  energyValue: {
    fontSize: 12,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.successBg,
  },
  energyBar: {
    flexDirection: 'row',
    gap: 2,
    height: 16,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    backgroundColor: Brand.surfaceDeep,
    padding: 2,
  },
  energySegment: {
    flex: 1,
  },
  energySegmentFilled: {
    backgroundColor: Brand.successBg,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  readMore: {
    fontSize: 12,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.successBg,
    marginTop: -6,
  },
  section: {
    gap: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: PixelFonts.headingBold,
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
    fontSize: 13,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  specValue: {
    fontSize: 13,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  branchName: {
    fontSize: 13,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.text,
  },
  branchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchLabel: {
    fontSize: 12,
    fontFamily: PixelFonts.bodySemiBold,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Brand.background,
    borderTopColor: Brand.divider,
    borderTopWidth: PixelBorder.thick,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 6,
  },
  cartButton: {
    backgroundColor: Brand.accent,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cartButtonDisabled: {
    backgroundColor: Brand.surfaceDeep,
  },
  cartButtonText: {
    fontSize: 13,
    fontFamily: PixelFonts.pixel,
    color: Brand.onAccent,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deliveryText: {
    fontSize: 11,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  infoBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43,33,24,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoCardWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  infoCard: {
    padding: 20,
    gap: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  infoCloseButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Brand.accent,
  },
  infoCloseText: {
    fontSize: 12,
    fontFamily: PixelFonts.headingBold,
    color: Brand.onAccent,
  },
});
