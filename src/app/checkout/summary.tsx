import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { ordersApi } from '@/api/orders';
import { AddressCard } from '@/components/shop/address-card';
import { PixelPanel } from '@/components/shop/pixel-panel';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, PixelBorder, PixelFonts, PixelShadow, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { useShop } from '@/store/shop-store';
import { Address } from '@/types/shop';
import { formatBaht } from '@/utils/format';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 50;

export default function CheckoutSummaryScreen() {
  const { addressId, couponCode, couponTitle, discountType, discountValue } =
    useLocalSearchParams<{
      addressId: string;
      couponCode?: string;
      couponTitle?: string;
      discountType?: string;
      discountValue?: string;
    }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { cart, selectedTotal } = useShop();

  const [address, setAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedItems = cart.filter((item) => item.selected);
  const shippingFee = selectedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  // Client-side preview only — the server always recomputes the authoritative
  // discount from the coupons table when the order is created.
  const previewDiscount = discountValue
    ? Math.min(
        selectedTotal,
        discountType === 'percent'
          ? Math.round((selectedTotal * Number(discountValue)) / 100)
          : Number(discountValue)
      )
    : 0;
  const total = selectedTotal + shippingFee - previewDiscount;

  useEffect(() => {
    if (!token || !addressId) return;
    addressesApi.list(token).then((list) => {
      setAddress(list.find((a) => a.id === Number(addressId)) ?? null);
    });
  }, [token, addressId]);

  const onConfirm = async () => {
    if (!token || !addressId) return;
    setError(null);
    setSubmitting(true);
    try {
      const order = await ordersApi.create(token, Number(addressId), couponCode ?? null);
      router.replace(`/checkout/success?orderId=${order.id}&orderNumber=${order.orderNumber}&total=${order.total}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สั่งซื้อไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="สรุปคำสั่งซื้อ" showBack />
      <RequireAuth title="สรุปคำสั่งซื้อ">
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 160 }]}
          showsVerticalScrollIndicator={false}>
          {address ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ADDRESS</Text>
              <AddressCard address={address} />
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>รายการสินค้า ({selectedItems.length})</Text>
            <View style={styles.items}>
              {selectedItems.map((item) => (
                <View key={item.product.id} style={styles.itemRow}>
                  <SkeletonImage
                    uri={item.product.images[0]}
                    style={styles.itemImage}
                    borderRadius={Radius.md}
                  />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemQty}>
                      {formatBaht(item.product.price)} x {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {formatBaht(item.product.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <PressableScale
            style={styles.couponRow}
            onPress={() =>
              router.push(`/coupons?addressId=${addressId}`)
            }>
            <Text style={styles.couponLabel}>คูปองส่วนลด</Text>
            <Text style={styles.couponValue}>
              {couponTitle || 'ยังไม่ได้เลือกคูปอง'}
            </Text>
          </PressableScale>

          <PixelPanel style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ยอดสินค้า</Text>
              <Text style={styles.summaryValue}>{formatBaht(selectedTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ค่าจัดส่ง</Text>
              <Text style={styles.summaryValue}>
                {shippingFee === 0 ? 'ฟรี' : formatBaht(shippingFee)}
              </Text>
            </View>
            {previewDiscount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ส่วนลดคูปอง</Text>
                <Text style={styles.summaryValue}>-{formatBaht(previewDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.dashedLine} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>ยอดรวม</Text>
              <Text style={styles.summaryTotalValue}>{formatBaht(total)}</Text>
            </View>
          </PixelPanel>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
            <Text style={styles.totalValue}>{formatBaht(total)}</Text>
          </View>
          <PressableScale
            style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
            pixelShadow={submitting ? undefined : PixelShadow.sm}
            onPress={onConfirm}
            disabled={submitting}>
            <Text style={styles.confirmText}>
              {submitting ? 'กำลังสั่งซื้อ...' : `PAY ${formatBaht(total)}`}
            </Text>
          </PressableScale>
        </View>
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
    paddingTop: 12,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  items: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    padding: 12,
  },
  itemImage: {
    width: 56,
    height: 56,
  },
  itemBody: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 12,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
  },
  itemQty: {
    fontSize: 11,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  itemTotal: {
    fontSize: 12,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    padding: 14,
  },
  couponLabel: {
    fontSize: 12,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
  },
  couponValue: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  summaryCard: {
    padding: 14,
    gap: 8,
  },
  summaryHeading: {
    fontSize: 10,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyMedium,
    color: Brand.text,
  },
  dashedLine: {
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Brand.divider,
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  summaryTotalValue: {
    fontSize: 13,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  error: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyMedium,
    color: Brand.danger,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    backgroundColor: Brand.background,
    borderTopWidth: PixelBorder.thick,
    borderTopColor: Brand.divider,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
  },
  confirmButton: {
    backgroundColor: Brand.accent,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 12,
    fontFamily: PixelFonts.pixel,
    color: Brand.onAccent,
  },
});
