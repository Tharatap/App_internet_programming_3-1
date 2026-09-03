import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge } from '@/components/shop/badge';
import { HeartButton } from '@/components/shop/heart-button';
import { PressableScale } from '@/components/shop/pressable-scale';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { PixelBorder, PixelFonts, PixelShadow, Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { Product } from '@/types/product';
import { formatBaht } from '@/utils/format';

interface Props {
  product: Product;
  variant?: 'grid' | 'row';
  /** ลำดับของการ์ดในลิสต์ ใช้หน่วงเวลาแอนิเมชันตอนเข้าจอทีละใบ (stagger effect) */
  index?: number;
}

/**
 * การ์ดสินค้าที่ใช้ซ้ำทั่วแอป — มี 2 รูปแบบ
 * `grid` = การ์ดแนวตั้ง 2 คอลัมน์ (หน้า Home/แคตตาล็อก)
 * `row`  = การ์ดแนวนอนเต็มแถว (หน้าค้นหา)
 */
export function ProductCard({ product, variant = 'grid', index = 0 }: Props) {
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const open = () => router.push(`/product/${product.id}`);
  // จำกัดดีเลย์ไว้ที่ 8 ตัวแรก (index สูงสุด = 8) กันไม่ให้การ์ดท้ายๆ ในลิสต์ยาว
  // ต้องรอแอนิเมชันนานเกินไปกว่าจะปรากฏ
  const entering = FadeInDown.duration(300).delay(Math.min(index, 8) * 60);

  if (variant === 'row') {
    return (
      <Animated.View entering={entering} style={styles.rowWrapper}>
        <PressableScale
          accessibilityLabel={`เปิดรายละเอียด ${product.name}`}
          onPress={open}
          pixelShadow={PixelShadow.sm}
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
        </PressableScale>
        {/* ปุ่มหัวใจลอยทับมุมขวาบน แยกจาก PressableScale เพื่อไม่ให้กดแล้วเด้งไปหน้ารายละเอียด */}
        <View style={styles.rowHeart}>
          <HeartButton productId={product.id} size={18} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={entering} style={styles.gridWrapper}>
      <PressableScale
        accessibilityLabel={`เปิดรายละเอียด ${product.name}`}
        onPress={open}
        pixelShadow={PixelShadow.sm}
        style={[styles.gridCard, !product.inStock && styles.dimmed]}>
        <View>
          <SkeletonImage
            uri={product.images[0]}
            style={styles.gridImage}
            borderRadius={Radius.md}
          />
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
      <View style={styles.gridHeart}>
        <HeartButton productId={product.id} size={18} />
      </View>
    </Animated.View>
  );
}

/** แสดงราคาปัจจุบัน + ราคาเดิม (ขีดฆ่า) ถ้าสินค้ามีการลดราคา */
function PriceRow({ product }: { product: Product }) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.priceRow}>
      <Text style={styles.price}>{formatBaht(product.price)}</Text>
      {product.originalPrice ? (
        <Text style={styles.originalPrice}>{formatBaht(product.originalPrice)}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  dimmed: { opacity: 0.55 },
  name: {
    fontSize: 13,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
    lineHeight: 18,
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
    fontSize: 12,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textMuted,
    textDecorationLine: 'line-through',
  },
  // Grid
  gridWrapper: { flex: 1 },
  gridCard: {
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    padding: 10,
    gap: 8,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
  },
  gridHeart: {
    position: 'absolute',
    top: 16,
    right: 19,
  },
  outOfStock: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  // Row
  rowWrapper: {},
  rowCard: {
    flexDirection: 'row',
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    padding: 12,
    paddingRight: 46,
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
    position: 'absolute',
    top: 12,
    right: 15,
  },
});
