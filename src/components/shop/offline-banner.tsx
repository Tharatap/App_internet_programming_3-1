import { StyleSheet, Text, View } from 'react-native';

import { Radius, type BrandPalette } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useStyles } from '@/hooks/use-styles';

export function OfflineBanner() {
  const styles = useStyles(makeStyles);
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

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
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
