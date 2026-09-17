import { StyleSheet, View } from 'react-native';

import { PixelBorder, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';
import type { ClusterColorKey } from '@/types/analytics';

export interface ShareSegment {
  key: string;
  value: number;
  color: ClusterColorKey;
}

interface Props {
  segments: ShareSegment[];
  height?: number;
}

/**
 * แถบสัดส่วนแบบต่อกัน — ใช้ View ธรรมดาไม่ใช้ SVG เพราะเป็นสี่เหลี่ยมเรียงกันเฉย ๆ
 * flex ทำได้ตรงกว่าและปรับตามความกว้างหน้าจอเองโดยไม่ต้องวัด layout
 */
export function ShareBar({ segments, height = 14 }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total <= 0) return null;

  // ตัดส่วนที่เป็น 0 ทิ้ง ไม่งั้นจะเหลือเส้นขอบบาง ๆ ค้างอยู่ทั้งที่ไม่มีข้อมูล
  const visible = segments.filter((segment) => segment.value > 0);

  return (
    <View style={[styles.bar, { height }]}>
      {visible.map((segment, index) => (
        <View
          key={segment.key}
          style={[
            { flex: segment.value, backgroundColor: Brand[segment.color] },
            index < visible.length - 1 && styles.divider,
          ]}
        />
      ))}
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
    backgroundColor: Brand.surfaceDeep,
  },
  divider: {
    borderRightWidth: PixelBorder.thin,
    borderRightColor: Brand.divider,
  },
});
