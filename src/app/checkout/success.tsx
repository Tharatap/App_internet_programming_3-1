import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, Radius } from '@/constants/theme';
import { formatBaht } from '@/utils/format';

export default function CheckoutSuccessScreen() {
  const { orderId, orderNumber, total } = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    total: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.iconWrapper}>
        <CheckCircle2 size={64} color={Brand.successText} strokeWidth={1.75} />
      </View>
      <Text style={styles.title}>สั่งซื้อสำเร็จ</Text>
      <Text style={styles.subtitle}>เลขที่คำสั่งซื้อ {orderNumber}</Text>
      {total ? <Text style={styles.total}>{formatBaht(Number(total))}</Text> : null}

      <View style={styles.actions}>
        <PressableScale
          style={styles.primaryButton}
          onPress={() => router.replace(`/orders/${orderId}`)}>
          <Text style={styles.primaryText}>ดูคำสั่งซื้อ</Text>
        </PressableScale>
        <PressableScale style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.secondaryText}>กลับหน้าแรก</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Brand.text,
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  total: {
    fontSize: 24,
    fontWeight: '800',
    color: Brand.text,
    marginTop: 8,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 32,
  },
  primaryButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
});
