import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { ClusterPalette, PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';
import type { MarketCluster, MarketMode, MarketProduct, StoreProfile } from '@/types/market';
import { formatBaht } from '@/utils/format';

interface Props {
  products: MarketProduct[];
  clusters: MarketCluster[];
  storeProfiles: StoreProfile[];
  mode: MarketMode;
}

const ROW_HEIGHT = 30;
const PADDING_LEFT = 104;
const PADDING_RIGHT = 14;
const PADDING_TOP = 14;
const AXIS_HEIGHT = 40;

/**
 * กราฟแสดงผลการจัดกลุ่มของ K-Means — 1 จุด = สินค้า 1 ชิ้น, 1 แถว = 1 ร้าน
 *
 * แกนนอนต้องเป็น "ค่าที่โมเดลใช้จัดกลุ่มจริง" ไม่ใช่ราคาเสมอไป:
 *   absolute → log(ราคา)        relative → เปอร์เซ็นไทล์ราคาภายในร้าน
 * ถ้าวาดโหมด relative ด้วยราคาดิบ จุดของแต่ละกลุ่มจะดูสลับกันไปมาจนเหมือนโมเดลมั่ว
 * ทั้งที่จริงมันแยกกลุ่มได้สะอาดในพื้นที่ของมันเอง
 *
 * จัดกลุ่มด้วยมิติเดียว เส้นแบ่งกลุ่มจึงเป็นเส้นตั้งตรง ๆ วาดออกมาให้เห็นได้เลย
 */
export function MarketScatter({ products, clusters, storeProfiles, mode }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const [width, setWidth] = useState(320);

  const chart = useMemo(() => {
    const valueOf = (product: MarketProduct) =>
      mode === 'absolute' ? Math.log1p(product.price) : product.percentileInStore;

    const values = products.map(valueOf);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const pad = rawMax === rawMin ? 0.5 : (rawMax - rawMin) * 0.05;
    const min = rawMin - pad;
    const max = rawMax + pad;

    const chartWidth = Math.max(40, width - PADDING_LEFT - PADDING_RIGHT);
    const xFor = (value: number) => PADDING_LEFT + ((value - min) / (max - min)) * chartWidth;

    // เส้นแบ่งกลุ่ม = กึ่งกลางระหว่าง "ค่าสูงสุดของชั้นล่าง" กับ "ค่าต่ำสุดของชั้นบน"
    const byTier = clusters.map((cluster) =>
      products.filter((p) => p.tierIndex === cluster.tierIndex).map(valueOf)
    );
    const boundaries: number[] = [];
    for (let index = 1; index < byTier.length; index += 1) {
      const lower = byTier[index - 1];
      const upper = byTier[index];
      if (lower.length === 0 || upper.length === 0) continue;
      boundaries.push((Math.max(...lower) + Math.min(...upper)) / 2);
    }

    const ticks = Array.from({ length: 4 }, (_, index) => min + ((max - min) * index) / 3);
    const tickLabel = (value: number) =>
      mode === 'absolute'
        ? formatBaht(Math.max(0, Math.round(Math.expm1(value))))
        : `${Math.round(value * 100)}%`;

    return { xFor, valueOf, boundaries, ticks, tickLabel, chartWidth };
  }, [clusters, mode, products, width]);

  const rows = storeProfiles;
  const height = PADDING_TOP + rows.length * ROW_HEIGHT + AXIS_HEIGHT;
  const axisY = PADDING_TOP + rows.length * ROW_HEIGHT;

  return (
    <View
      style={styles.container}
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      <Text style={styles.title}>
        {mode === 'absolute'
          ? 'แกนนอน = ราคาจริง (สเกลลอการิทึม)'
          : 'แกนนอน = ตำแหน่งราคาภายในร้านตัวเอง'}
      </Text>

      <Svg width="100%" height={height} accessibilityLabel="กราฟผลการจัดกลุ่มสินค้าข้ามร้าน">
        {/* เส้นแบ่งกลุ่มวาดก่อนจุด เพื่อให้จุดทับอยู่ด้านบน */}
        {chart.boundaries.map((value, index) => (
          <Line
            key={`boundary-${index}`}
            x1={chart.xFor(value)}
            y1={PADDING_TOP - 6}
            x2={chart.xFor(value)}
            y2={axisY}
            stroke={Brand.textMuted}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        ))}

        {rows.map((store, rowIndex) => {
          const y = PADDING_TOP + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
          return (
            <SvgText
              key={`label-${store.storeId}`}
              x={PADDING_LEFT - 8}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fontFamily={PixelFonts.bodyRegular}
              fill={Brand.textSecondary}>
              {store.storeName.replace(' (ของเรา)', '')}
            </SvgText>
          );
        })}

        {rows.map((store, rowIndex) => {
          const y = PADDING_TOP + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
          return products
            .filter((product) => product.storeId === store.storeId)
            .map((product) => (
              <Circle
                key={product.key}
                cx={chart.xFor(chart.valueOf(product))}
                cy={y}
                r={4.5}
                fill={Brand[ClusterPalette[product.tierIndex % ClusterPalette.length]]}
                stroke={Brand.divider}
                strokeWidth={1.5}
              />
            ));
        })}

        <Line
          x1={PADDING_LEFT}
          y1={axisY}
          x2={PADDING_LEFT + chart.chartWidth}
          y2={axisY}
          stroke={Brand.divider}
          strokeWidth={2}
        />
        {chart.ticks.map((value, index) => (
          <SvgText
            key={`tick-${index}`}
            x={chart.xFor(value)}
            y={axisY + 15}
            textAnchor="middle"
            fontSize={8}
            fontFamily={PixelFonts.bodyRegular}
            fill={Brand.textSecondary}>
            {chart.tickLabel(value)}
          </SvgText>
        ))}
        <SvgText
          x={PADDING_LEFT + chart.chartWidth / 2}
          y={axisY + 31}
          textAnchor="middle"
          fontSize={9}
          fontFamily={PixelFonts.bodySemiBold}
          fill={Brand.textMuted}>
          เส้นประ = เส้นแบ่งกลุ่มที่ K-Means คำนวณได้
        </SvgText>
      </Svg>

      <View style={styles.legend}>
        {clusters.map((cluster) => (
          <View key={cluster.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: Brand[ClusterPalette[cluster.tierIndex % ClusterPalette.length]] },
              ]}
            />
            <Text style={styles.legendText}>{cluster.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  container: {
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    fontSize: 11,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderWidth: 1, borderColor: Brand.divider },
  legendText: { fontSize: 10, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
});
