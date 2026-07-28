import { CheckCircle2, Pencil, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/shop/badge';
import { PressableScale } from '@/components/shop/pressable-scale';
import { Brand, Radius } from '@/constants/theme';
import { Address } from '@/types/shop';

interface Props {
  address: Address;
  /** Highlights the card with an accent border + check icon (checkout selection). */
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Reusable address summary card — used in checkout selection and address management. */
export function AddressCard({ address, selected, onPress, onEdit, onDelete }: Props) {
  return (
    <PressableScale
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{address.label}</Text>
          {address.isDefault ? <Badge label="ค่าเริ่มต้น" tone="accent" /> : null}
        </View>
        {selected ? <CheckCircle2 size={20} color={Brand.successText} strokeWidth={2} /> : null}
      </View>

      <Text style={styles.recipient}>
        {address.recipient} · {address.phone}
      </Text>
      <Text style={styles.line} numberOfLines={2}>
        {address.line1} {address.district} {address.province} {address.postcode}
      </Text>

      {onEdit || onDelete ? (
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable style={styles.actionButton} onPress={onEdit} hitSlop={8}>
              <Pencil size={15} color={Brand.textSecondary} strokeWidth={2} />
              <Text style={styles.actionText}>แก้ไข</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable style={styles.actionButton} onPress={onDelete} hitSlop={8}>
              <Trash2 size={15} color={Brand.danger} strokeWidth={2} />
              <Text style={[styles.actionText, { color: Brand.danger }]}>ลบ</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 16,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Brand.successText,
    backgroundColor: Brand.successBg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.text,
  },
  recipient: {
    fontSize: 14,
    color: Brand.text,
  },
  line: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
});
