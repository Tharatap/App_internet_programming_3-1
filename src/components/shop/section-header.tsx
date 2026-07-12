import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/shop/badge';
import { Brand } from '@/constants/theme';

interface Props {
  title: string;
  /** Optional pill shown next to the title (e.g. countdown). */
  badge?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

/** Section title row with an optional "see all" link on the right. */
export function SectionHeader({ title, badge, onSeeAll, seeAllLabel = 'ดูทั้งหมด' }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {badge ? <Badge label={badge} tone="accent" /> : null}
      </View>
      {onSeeAll ? (
        <Pressable style={styles.seeAll} onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAllText}>{seeAllLabel}</Text>
          <ChevronRight size={14} color={Brand.textSecondary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Brand.text,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
});
