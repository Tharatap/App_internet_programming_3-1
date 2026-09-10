import { StyleSheet, Text, View } from 'react-native';

import { PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';

interface Props {
  label: string;
  value: string;
  detail: string;
}

export function StatTile({ label, value, detail }: Props) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  tile: {
    width: '48%',
    minHeight: 112,
    justifyContent: 'space-between',
    gap: 5,
    padding: 12,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
  },
  label: {
    fontSize: 11,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.textSecondary,
  },
  value: {
    fontSize: 22,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  detail: {
    fontSize: 10,
    lineHeight: 15,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textMuted,
  },
});
