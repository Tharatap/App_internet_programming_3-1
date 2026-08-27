import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { PixelBorder, PixelShadow, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';

type Variant = 'surface' | 'floating' | 'favorite';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  size?: number;
  variant?: Variant;
  style?: ViewStyle;
  /** Renders a small red dot in the top-right (e.g. unread notifications). */
  showBadgeDot?: boolean;
  accessibilityLabel?: string;
}

/** Square pixel-bordered icon button (36–40px) used across headers and cards. */
export function IconButton({
  children,
  onPress,
  size = 40,
  variant = 'surface',
  style,
  showBadgeDot,
  accessibilityLabel,
}: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const backgroundColor =
    variant === 'floating'
      ? Brand.floatingSurface
      : variant === 'favorite'
        ? Brand.favoriteBg
        : Brand.surface;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      pixelShadow={PixelShadow.sm}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor,
          borderWidth: PixelBorder.base,
          borderColor: Brand.divider,
        },
        style,
      ]}>
      {children}
      {showBadgeDot ? <View style={styles.dot} /> : null}
    </PressableScale>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: Brand.divider,
    backgroundColor: Brand.notification,
  },
});
