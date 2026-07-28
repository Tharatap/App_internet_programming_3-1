import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ordersApi } from '@/api/orders';
import { Badge } from '@/components/shop/badge';
import { RequireAuth } from '@/components/shop/require-auth';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { Order, OrderStatus } from '@/types/shop';
import { formatBaht } from '@/utils/format';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  shipping: 'กำลังจัดส่ง',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิก',
};

const STATUS_TONE: Record<OrderStatus, 'neutral' | 'accent' | 'success' | 'danger'> = {
  pending: 'neutral',
  confirmed: 'accent',
  shipping: 'accent',
  delivered: 'success',
  cancelled: 'danger',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    ordersApi
      .detail(token, Number(id))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [token, id]);

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="รายละเอียดคำสั่งซื้อ" showBack />
      <RequireAuth title="คำสั่งซื้อ">
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.text} />
          </View>
        ) : !order ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>ไม่พบคำสั่งซื้อนี้</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerCard}>
              <View style={styles.headerRow}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Badge label={STATUS_LABEL[order.status]} tone={STATUS_TONE[order.status]} />
              </View>
              <Text style={styles.date}>
                {new Date(order.createdAt).toLocaleDateString('th-TH', {
                  dateStyle: 'long',
                })}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ที่อยู่จัดส่ง</Text>
              <View style={styles.addressCard}>
                <Text style={styles.addressName}>
                  {order.shipRecipient} · {order.shipPhone}
                </Text>
                <Text style={styles.addressLine}>{order.shipAddress}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>รายการสินค้า</Text>
              <View style={styles.items}>
                {order.items.map((item, index) => (
                  <View key={`${item.productId}-${index}`} style={styles.itemRow}>
                    <SkeletonImage
                      uri={item.imageUrl ?? undefined}
                      style={styles.itemImage}
                      borderRadius={Radius.md}
                    />
                    <View style={styles.itemBody}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemQty}>
                        {formatBaht(item.price)} x {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>{formatBaht(item.price * item.quantity)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ยอดสินค้า</Text>
                <Text style={styles.summaryValue}>{formatBaht(order.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>ค่าจัดส่ง</Text>
                <Text style={styles.summaryValue}>
                  {order.shippingFee === 0 ? 'ฟรี' : formatBaht(order.shippingFee)}
                </Text>
              </View>
              {order.discount > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ส่วนลด</Text>
                  <Text style={styles.summaryValue}>-{formatBaht(order.discount)}</Text>
                </View>
              ) : null}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
                <Text style={styles.totalValue}>{formatBaht(order.total)}</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </RequireAuth>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Brand.textSecondary,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 20,
  },
  headerCard: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.text,
  },
  date: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.text,
  },
  addressCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 16,
    gap: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  addressLine: {
    fontSize: 13,
    color: Brand.textSecondary,
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
  totalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Brand.divider,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Brand.text,
  },
});
