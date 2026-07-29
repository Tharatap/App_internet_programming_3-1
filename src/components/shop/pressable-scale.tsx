import { type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Brand } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = ComponentProps<typeof Pressable> & {
  /** Scale applied while pressed (default 0.97 per design system). */
  activeScale?: number;
  /**
   * Hard pixel drop-shadow offset in px (e.g. `PixelShadow.sm/md/lg`). When
   * set, renders a solid offset "shadow" panel behind the content and the
   * content slides onto it on press, instead of (or in addition to) scaling.
   */
  pixelShadow?: number;
  shadowColor?: string;
};

/**
 * Pressable used for all tappable cards/buttons in the shop UI. With
 * `pixelShadow` it renders the cozy-pixel-theme "hard shadow that collapses on
 * press" interaction; without it, falls back to the original subtle scale-down.
 */
export function PressableScale({
  activeScale = 0.97,
  pixelShadow,
  shadowColor = Brand.divider,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: pixelShadow
      ? [{ translateX: press.value }, { translateY: press.value }]
      : [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(activeScale, { duration: 150 });
    if (pixelShadow) press.value = withTiming(pixelShadow, { duration: 100 });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    if (pixelShadow) press.value = withTiming(0, { duration: 100 });
  };

  if (!pixelShadow) {
    return (
      <AnimatedPressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[animatedStyle, style]}
        {...rest}
      />
    );
  }

  return (
    <View style={{ marginRight: pixelShadow, marginBottom: pixelShadow }}>
      <View
        style={{
          position: 'absolute',
          top: pixelShadow,
          left: pixelShadow,
          width: '100%',
          height: '100%',
          backgroundColor: shadowColor,
          pointerEvents: 'none',
        }}
      />
      <AnimatedPressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[animatedStyle, style]}
        {...rest}
      />
    </View>
  );
}
