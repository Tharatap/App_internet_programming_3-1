import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { PixelBorder, PixelShadow } from '@/constants/theme';
import { useBrand } from '@/store/theme-store';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  /** Hard shadow offset — use `PixelShadow.sm/md/lg`. */
  shadowOffset?: number;
  shadowColor?: string;
  borderWidth?: number;
}

/**
 * Static (non-pressable) panel with a thick pixel border and a hard offset
 * "shadow" (a solid rectangle behind, no blur) — the same visual trick as
 * `PressableScale`'s `pixelShadow`, for cards that aren't buttons.
 */
export function PixelPanel({
  children,
  style,
  backgroundColor,
  shadowOffset = PixelShadow.md,
  shadowColor,
  borderWidth = PixelBorder.base,
}: Props) {
  const Brand = useBrand();
  const panelBackgroundColor = backgroundColor ?? Brand.surface;
  const panelShadowColor = shadowColor ?? Brand.divider;

  return (
    <View style={{ marginRight: shadowOffset, marginBottom: shadowOffset }}>
      <View
        style={{
          position: 'absolute',
          top: shadowOffset,
          left: shadowOffset,
          width: '100%',
          height: '100%',
          backgroundColor: panelShadowColor,
          pointerEvents: 'none',
        }}
      />
      <View
        style={[
          { backgroundColor: panelBackgroundColor, borderWidth, borderColor: panelShadowColor },
          style,
        ]}>
        {children}
      </View>
    </View>
  );
}
