import { useRouter } from 'expo-router';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Checkbox } from '@/components/shop/checkbox';
import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { QuantityStepper } from '@/components/shop/quantity-stepper';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, PixelBorder, PixelFonts, PixelShadow, Radius } from '@/constants/theme';
import { useShop } from '@/store/shop-store';
import { formatBaht } from '@/utils/format';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    cart,
    selectedTotal,
    setQuantity,
    toggleCartSelected,
    setAllSelected,
  } = useShop();

  const allSelected = cart.length > 0 && cart.every((item) => item.selected);

  const onCheckout = () => {
    if (!cart.some((item) => item.selected)) {
      Alert.alert('กรุณาเลือกสินค้า', 'เลือกสินค้าอย่างน้อย 1 ชิ้นก่อนชำระเงิน');
      return;
    }
    router.push('/checkout/address');
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="ตะกร้าสินค้า" />

      <RequireAuth title="ตะกร้าสินค้า">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Delivery address */}
        <PixelPanel shadowOffset={PixelShadow.sm} style={styles.address}>
          <Pressable style={styles.addressInner} onPress={() => router.push('/addresses')}>
            <MapPin size={18} color={Brand.text} strokeWidth={2} />
            <View style={styles.addressBody}>
              <Text style={styles.addressLabel}>จัดส่งไปที่</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                92 ถ.สุขุมวิท กรุงเทพฯ
              </Text>
            </View>
            <ChevronRight size={18} color={Brand.textMuted} strokeWidth={2} />
          </Pressable>
        </PixelPanel>

        {cart.length === 0 ? (
          <Text style={styles.empty}>ยังไม่มีสินค้าในตะกร้า</Text>
        ) : (
          <>
            {/* Select all */}
            <Pressable
              style={styles.selectAll}
              onPress={() => setAllSelected(!allSelected)}>
              <Checkbox
                checked={allSelected}
                onToggle={() => setAllSelected(!allSelected)}
                accessibilityLabel="เลือกทั้งหมด"
              />
              <Text style={styles.selectAllText}>เลือกทั้งหมด</Text>
            </Pressable>

            {/* Items */}
            <View style={styles.items}>
              {cart.map((item) => (
                <View key={item.product.id} style={styles.item}>
                  <Checkbox
                    checked={item.selected}
                    onToggle={() => toggleCartSelected(item.product.id)}
                  />
                  <SkeletonImage
                    uri={item.product.images[0]}
                    style={styles.itemImage}
                    borderRadius={Radius.md}
                  />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{formatBaht(item.product.price)}</Text>
                      <QuantityStepper
                        quantity={item.quantity}
                        onChange={(q) => setQuantity(item.product.id, q)}
                        min={0}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky checkout */}
      {cart.length > 0 ? (
        <View style={[styles.sticky, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ยอดรวม</Text>
            <Text style={styles.totalValue}>{formatBaht(selectedTotal)}</Text>
          </View>
          <PressableScale
            style={styles.checkoutButton}
            pixelShadow={PixelShadow.sm}
            onPress={onCheckout}>
            <Text style={styles.checkoutText}>CHECKOUT ▸</Text>
          </PressableScale>
        </View>
      ) : null}
      </RequireAuth>
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
    paddingBottom: 160,
    gap: 16,
  },
  address: {},
  addressInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  addressBody: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
  },
  addressText: {
    fontSize: 13,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAllText: {
    fontSize: 13,
    fontFamily: PixelFonts.bodyMedium,
    color: Brand.text,
  },
  items: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    padding: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
  },
  itemBody: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 13,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
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
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  totalValue: {
    fontSize: 17,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  checkoutButton: {
    backgroundColor: Brand.accent,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 13,
    fontFamily: PixelFonts.pixel,
    color: Brand.onAccent,
  },
});
