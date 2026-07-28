import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ticket } from 'lucide-react-native';

import { couponsApi } from '@/api/coupons';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { Coupon } from '@/types/shop';
import { formatBaht } from '@/utils/format';

function discountLabel(coupon: Coupon): string {
  return coupon.discountType === 'percent'
    ? `ลด ${coupon.discountValue}%`
    : `ลด ${formatBaht(coupon.discountValue)}`;
}

export default function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    couponsApi
      .list(token)
      .then(setCoupons)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="คูปองส่วนลด" showBack />
      <RequireAuth title="คูปองส่วนลด">
        <FlatList
          data={coupons}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.code}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.discount}>{discountLabel(item)}</Text>
                {item.minSpend > 0 ? (
                  <Text style={styles.condition}>
                    เมื่อซื้อครบ {formatBaht(item.minSpend)}
                  </Text>
                ) : null}
                {item.expiresAt ? (
                  <Text style={styles.condition}>
                    หมดอายุ{' '}
                    {new Date(item.expiresAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ticket size={32} color={Brand.textSecondary} strokeWidth={2} />
                <Text style={styles.emptyText}>ยังไม่มีคูปองในตอนนี้</Text>
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
    flexDirection: 'row',
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  codeBadge: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.successBg,
    paddingVertical: 16,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Brand.successText,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  discount: {
    fontSize: 16,
    fontWeight: '800',
    color: Brand.text,
  },
  condition: {
    fontSize: 12,
    color: Brand.textSecondary,
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
