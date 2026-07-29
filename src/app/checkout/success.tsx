import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, PixelBorder, PixelFonts, PixelShadow } from '@/constants/theme';
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
        <CheckCircle2 size={64} color={Brand.successBg} strokeWidth={2} />
      </View>
      <Text style={styles.title}>สั่งซื้อสำเร็จ</Text>
      <Text style={styles.subtitle}>เลขที่คำสั่งซื้อ {orderNumber}</Text>
      {total ? <Text style={styles.total}>{formatBaht(Number(total))}</Text> : null}

      <View style={styles.actions}>
        <PressableScale
          style={styles.primaryButton}
          pixelShadow={PixelShadow.sm}
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
    fontSize: 18,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  total: {
    fontSize: 20,
    fontFamily: PixelFonts.pixel,
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
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 13,
    fontFamily: PixelFonts.pixel,
    color: Brand.onAccent,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 13,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
  },
});
