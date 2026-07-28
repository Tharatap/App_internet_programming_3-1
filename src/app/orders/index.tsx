import { useFocusEffect, useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ordersApi } from '@/api/orders';
import { Badge } from '@/components/shop/badge';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
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

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      ordersApi
        .list(token)
        .then(setOrders)
        .finally(() => setLoading(false));
    }, [token])
  );

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="คำสั่งซื้อของฉัน" showBack />
      <RequireAuth title="คำสั่งซื้อของฉัน">
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PressableScale
              style={styles.card}
              onPress={() => router.push(`/orders/${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                <Badge label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={styles.itemCount}>{item.items.length} รายการ</Text>
              <Text style={styles.total}>{formatBaht(item.total)}</Text>
            </PressableScale>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Package size={32} color={Brand.textSecondary} strokeWidth={2} />
                <Text style={styles.emptyText}>ยังไม่มีคำสั่งซื้อ</Text>
              </View>
            ) : null
          }
        />
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
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
  },
  itemCount: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    marginTop: 60,
  },
  emptyText: {
    color: Brand.textSecondary,
    fontSize: 14,
  },
});
