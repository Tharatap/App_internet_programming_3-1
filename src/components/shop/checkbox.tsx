import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { PixelBorder, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';

interface Props {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel?: string;
}

/** Square pixel checkbox; fills lime green when checked. */
export function Checkbox({ checked, onToggle, accessibilityLabel }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();

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

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: Brand.accent,
  },
});
