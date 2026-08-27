import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/shop/badge';
import { PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';

interface Props {
  title: string;
  /** Optional pill shown next to the title (e.g. countdown). */
  badge?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

/** Section title row with an optional "see all" link on the right. */
export function SectionHeader({ title, badge, onSeeAll, seeAllLabel = 'ดูทั้งหมด' }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();

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

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
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
    fontSize: 16,
    fontFamily: PixelFonts.headingBold,
    color: Brand.text,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
  },
});
