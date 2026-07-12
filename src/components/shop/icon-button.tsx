import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';
import { PressableScale } from '@/components/shop/pressable-scale';

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

/** Circular icon button (36–40px) used across headers and cards. */
export function IconButton({
  children,
  onPress,
  size = 40,
  variant = 'surface',
  style,
  showBadgeDot,
  accessibilityLabel,
}: Props) {
  const backgroundColor =
    variant === 'floating'
      ? 'rgba(255,255,255,0.85)'
      : variant === 'favorite'
        ? Brand.favoriteBg
        : Brand.surface;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        style,
      ]}>
      {children}
      {showBadgeDot ? <View style={styles.dot} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.notification,
  },
});
