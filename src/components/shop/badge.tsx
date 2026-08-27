import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';

type Tone = 'success' | 'accent' | 'neutral' | 'danger';

interface Props {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

const makeToneStyles = (Brand: BrandPalette): Record<Tone, { bg: string; fg: string }> => ({
  success: { bg: Brand.successBg, fg: '#FFFDF5' },
  accent: { bg: Brand.accent, fg: Brand.onAccent },
  neutral: { bg: Brand.surface, fg: Brand.textSecondary },
  danger: { bg: Brand.favoriteBg, fg: Brand.danger },
});

/** Small rectangular pixel-bordered label (energy-saving, ratings, discount, etc.). */
export function Badge({ label, tone = 'neutral', style }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const toneStyles = makeToneStyles(Brand);
  const { bg, fg } = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  text: {
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
  },
});
