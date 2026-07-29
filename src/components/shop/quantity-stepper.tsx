import { Minus, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, PixelBorder, PixelFonts, PixelShadow } from '@/constants/theme';

interface Props {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

/** −/＋ pixel stepper with square buttons and a value in the middle. */
export function QuantityStepper({ quantity, onChange, min = 1, max = 99 }: Props) {
  const dec = () => onChange(Math.max(min, quantity - 1));
  const inc = () => onChange(Math.min(max, quantity + 1));

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityLabel="ลดจำนวน"
        onPress={dec}
        pixelShadow={PixelShadow.sm}
        style={styles.square}>
        <Minus size={14} color={Brand.text} strokeWidth={3} />
      </PressableScale>
      <Text style={styles.value}>{quantity}</Text>
      <PressableScale
        accessibilityLabel="เพิ่มจำนวน"
        onPress={inc}
        pixelShadow={PixelShadow.sm}
        style={[styles.square, styles.squareAccent]}>
        <Plus size={14} color={Brand.text} strokeWidth={3} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  square: {
    width: 26,
    height: 26,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareAccent: {
    backgroundColor: Brand.accent,
  },
  value: {
    fontSize: 12,
    fontFamily: PixelFonts.pixel,
    color: Brand.text,
    minWidth: 18,
    textAlign: 'center',
  },
});
