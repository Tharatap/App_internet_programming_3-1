import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <Text style={styles.text}>ออฟไลน์ – แสดงข้อมูลล่าสุด</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Brand.danger,
  },
  text: {
    color: Brand.surface,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
