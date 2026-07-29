import {
  AirVent,
  CookingPot,
  Fan,
  LayoutGrid,
  Microwave,
  Refrigerator,
  Tv,
  WashingMachine,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, CategoryPalette, PixelBorder, PixelFonts, PixelShadow } from '@/constants/theme';
import { CategoryIconName } from '@/types/product';

const iconMap: Record<CategoryIconName, LucideIcon> = {
  airVent: AirVent,
  refrigerator: Refrigerator,
  tv: Tv,
  washingMachine: WashingMachine,
  fan: Fan,
  cookingPot: CookingPot,
  microwave: Microwave,
  grid: LayoutGrid,
};

interface Props {
  name: CategoryIconName;
  label: string;
  onPress?: () => void;
  /** Cycles through the pastel category palette — pass the item's list index. */
  paletteIndex?: number;
}

/** Square pixel-bordered category tile with an icon and a caption below it. */
export function CategoryIcon({ name, label, onPress, paletteIndex = 0 }: Props) {
  const Icon = iconMap[name];
  const backgroundColor = CategoryPalette[paletteIndex % CategoryPalette.length];

  return (
    <PressableScale
      style={styles.wrapper}
      onPress={onPress}
      pixelShadow={PixelShadow.sm}
      accessibilityLabel={label}>
      <View style={[styles.tile, { backgroundColor }]}>
        <Icon size={22} color={Brand.text} strokeWidth={2} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 60,
    gap: 6,
  },
  tile: {
    width: 52,
    height: 48,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
});
