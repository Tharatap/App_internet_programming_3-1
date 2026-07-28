import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { ordersApi } from '@/api/orders';
import { AddressCard } from '@/components/shop/address-card';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { useShop } from '@/store/shop-store';
import { Address } from '@/types/shop';
import { formatBaht } from '@/utils/format';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 50;

export default function CheckoutSummaryScreen() {
  const { addressId } = useLocalSearchParams<{ addressId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { cart, selectedTotal } = useShop();

  const [address, setAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedItems = cart.filter((item) => item.selected);
  const shippingFee = selectedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = selectedTotal + shippingFee;

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
      const order = await ordersApi.create(token, Number(addressId));
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
              <Text style={styles.sectionTitle}>ที่อยู่จัดส่ง</Text>
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

          <View style={styles.section}>
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
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
            <Text style={styles.totalValue}>{formatBaht(total)}</Text>
          </View>
          <PressableScale
            style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
            onPress={onConfirm}
            disabled={submitting}>
            <Text style={styles.confirmText}>
              {submitting ? 'กำลังสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
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
    fontSize: 15,
    fontWeight: '700',
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
    borderRadius: Radius.card,
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
    fontSize: 13,
    color: Brand.text,
    fontWeight: '500',
  },
  itemQty: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Brand.text,
  },
  error: {
    fontSize: 13,
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
    borderTopWidth: 1,
    borderTopColor: Brand.divider,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Brand.text,
  },
  confirmButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
