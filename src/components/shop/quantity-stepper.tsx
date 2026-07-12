import { Minus, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand } from '@/constants/theme';

interface Props {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

/** −/＋ stepper with circular buttons and a value in the middle. */
export function QuantityStepper({ quantity, onChange, min = 1, max = 99 }: Props) {
  const dec = () => onChange(Math.max(min, quantity - 1));
  const inc = () => onChange(Math.min(max, quantity + 1));

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityLabel="ลดจำนวน"
        onPress={dec}
        style={styles.circle}>
        <Minus size={16} color={Brand.text} strokeWidth={2.5} />
      </PressableScale>
      <Text style={styles.value}>{quantity}</Text>
      <PressableScale
        accessibilityLabel="เพิ่มจำนวน"
        onPress={inc}
        style={styles.circle}>
        <Plus size={16} color={Brand.text} strokeWidth={2.5} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: Brand.text,
    minWidth: 20,
    textAlign: 'center',
  },
});
