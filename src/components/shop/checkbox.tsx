import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { Brand } from '@/constants/theme';

interface Props {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel?: string;
}

/** Small rounded checkbox; fills lime green when checked. */
export function Checkbox({ checked, onToggle, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onToggle}
      style={[styles.box, checked && styles.boxChecked]}>
      {checked ? <Check size={14} color={Brand.onAccent} strokeWidth={3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Brand.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: Brand.accent,
    borderColor: Brand.accent,
  },
});
