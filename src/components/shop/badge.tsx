import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Brand, PixelBorder, PixelFonts } from '@/constants/theme';

type Tone = 'success' | 'accent' | 'neutral' | 'danger';

interface Props {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: Brand.successBg, fg: '#FFFDF5' },
  accent: { bg: Brand.accent, fg: Brand.onAccent },
  neutral: { bg: Brand.surface, fg: Brand.textSecondary },
  danger: { bg: Brand.favoriteBg, fg: Brand.danger },
};

/** Small rectangular pixel-bordered label (energy-saving, ratings, discount, etc.). */
export function Badge({ label, tone = 'neutral', style }: Props) {
  const { bg, fg } = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
