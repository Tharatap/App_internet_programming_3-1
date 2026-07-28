import { X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Checkbox } from '@/components/shop/checkbox';
import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, Radius } from '@/constants/theme';

export type PriceRange = 'all' | 'under1000' | '1000to5000' | '5000to10000' | 'over10000';

export interface FilterValue {
  brand: string | null;
  priceRange: PriceRange;
  energyMin: number;
  inStockOnly: boolean;
}

export const defaultFilterValue: FilterValue = {
  brand: null,
  priceRange: 'all',
  energyMin: 0,
  inStockOnly: false,
};

const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'under1000', label: 'ต่ำกว่า ฿1,000' },
  { value: '1000to5000', label: '฿1,000–5,000' },
  { value: '5000to10000', label: '฿5,000–10,000' },
  { value: 'over10000', label: 'มากกว่า ฿10,000' },
];

const ENERGY_OPTIONS = [0, 70, 80, 90] as const;

interface Props {
  visible: boolean;
  onClose: () => void;
  brands: string[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  /** Number of products matching the current filter — shown on the apply button. */
  resultCount: number;
}

/** Bottom sheet for advanced filtering: brand, price range, energy rating, stock. */
export function FilterSheet({ visible, onClose, brands, value, onChange, resultCount }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>ตัวกรอง</Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="ปิด">
            <X size={20} color={Brand.text} strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {brands.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ยี่ห้อ</Text>
              <View style={styles.chipRow}>
                <Chip
                  label="ทั้งหมด"
                  selected={value.brand === null}
                  onPress={() => onChange({ ...value, brand: null })}
                />
                {brands.map((brand) => (
                  <Chip
                    key={brand}
                    label={brand}
                    selected={value.brand === brand}
                    onPress={() => onChange({ ...value, brand })}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ช่วงราคา</Text>
            <View style={styles.chipRow}>
              {PRICE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={value.priceRange === opt.value}
                  onPress={() => onChange({ ...value, priceRange: opt.value })}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เบอร์ประหยัดไฟ</Text>
            <View style={styles.chipRow}>
              {ENERGY_OPTIONS.map((min) => (
                <Chip
                  key={min}
                  label={min === 0 ? 'ทั้งหมด' : `${min}% ขึ้นไป`}
                  selected={value.energyMin === min}
                  onPress={() => onChange({ ...value, energyMin: min })}
                />
              ))}
            </View>
          </View>

          <Pressable
            style={styles.stockRow}
            onPress={() => onChange({ ...value, inStockOnly: !value.inStockOnly })}>
            <Checkbox
              checked={value.inStockOnly}
              onToggle={() => onChange({ ...value, inStockOnly: !value.inStockOnly })}
              accessibilityLabel="แสดงเฉพาะสินค้าที่มีสต็อก"
            />
            <Text style={styles.stockLabel}>แสดงเฉพาะสินค้าที่มีสต็อก</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={() => onChange(defaultFilterValue)} style={styles.clearButton}>
            <Text style={styles.clearText}>ล้างตัวกรอง</Text>
          </Pressable>
          <PressableScale style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyText}>ดูผลลัพธ์ ({resultCount})</Text>
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Brand.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.text,
  },
  body: {
    paddingHorizontal: 20,
  },
  section: {
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surface,
  },
  chipSelected: {
    backgroundColor: Brand.accent,
  },
  chipText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  chipTextSelected: {
    color: Brand.onAccent,
    fontWeight: '600',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stockLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.divider,
  },
  clearButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Brand.surface,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
