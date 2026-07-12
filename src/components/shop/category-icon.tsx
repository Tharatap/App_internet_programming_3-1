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
import { Brand } from '@/constants/theme';
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
}

/** Circular category button with a lucide icon and a caption below it. */
export function CategoryIcon({ name, label, onPress }: Props) {
  const Icon = iconMap[name];
  return (
    <PressableScale style={styles.wrapper} onPress={onPress} accessibilityLabel={label}>
      <View style={styles.circle}>
        <Icon size={24} color={Brand.text} strokeWidth={1.75} />
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
    width: 64,
    gap: 6,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: Brand.textSecondary,
    textAlign: 'center',
  },
});
