import { Heart } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Brand, PixelBorder } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  productId: string;
  size?: number;
  /** Square pixel-bordered background (for floating on card/image corners). */
  withBackground?: boolean;
}

/** Wishlist toggle with a micro-bounce animation and color change. */
export function HeartButton({ productId, size = 22, withBackground = true }: Props) {
  const { isFavorite, toggleFavorite } = useShop();
  const active = isFavorite(productId);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    scale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withTiming(1, { duration: 120 })
    );
    toggleFavorite(productId);
  };

  const dimension = size + 16;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={active ? 'นำออกจากรายการโปรด' : 'เพิ่มลงรายการโปรด'}
      hitSlop={8}
      onPress={onPress}
      style={[
        animatedStyle,
        withBackground && {
          width: dimension,
          height: dimension,
          borderWidth: PixelBorder.base,
          borderColor: Brand.divider,
          backgroundColor: active ? Brand.favoriteBg : 'rgba(255,253,245,0.9)',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}>
      <Heart
        size={size}
        color={active ? Brand.favoriteIcon : Brand.textSecondary}
        fill={active ? Brand.favoriteIcon : 'transparent'}
        strokeWidth={2}
      />
    </AnimatedPressable>
  );
}
