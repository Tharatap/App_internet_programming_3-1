import { type ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = ComponentProps<typeof Pressable> & {
  /** Scale applied while pressed (default 0.97 per design system). */
  activeScale?: number;
};

/**
 * Pressable that scales down slightly on press with a 150ms transition, used for
 * all tappable cards and buttons in the shop UI.
 */
export function PressableScale({ activeScale = 0.97, style, ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(activeScale, { duration: 150 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 });
      }}
      style={[animatedStyle, style]}
      {...rest}
    />
  );
}
