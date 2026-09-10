import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

import { PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';
import type { ClusterColorKey, ClusteredProduct, ProductCluster } from '@/types/analytics';
import { formatBaht } from '@/utils/format';

interface Props {
  products: ClusteredProduct[];
  clusters: ProductCluster[];
}

const HEIGHT = 240;
const PADDING_LEFT = 52;
const PADDING_RIGHT = 16;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 42;
/** ขอบเขตที่คะแนนรีวิวเป็นไปได้จริง — ใช้ครอบผลลัพธ์ ไม่ใช่ใช้เป็นขอบแกนตายตัว */
const RATING_FLOOR = 0;
const RATING_CEILING = 5;

export function ClusterScatter({ products, clusters }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const [width, setWidth] = useState(320);

  const clusterById = useMemo(
    () => new Map(clusters.map((cluster) => [cluster.id, cluster])),
    [clusters]
  );
  const chart = useMemo(() => {
    const loggedPrices = products.map((product) => Math.log1p(product.price));
    const rawMin = Math.min(...loggedPrices);
    const rawMax = Math.max(...loggedPrices);
    const logPadding = rawMax === rawMin ? 0.5 : (rawMax - rawMin) * 0.06;
    const minLog = rawMin - logPadding;
    const maxLog = rawMax + logPadding;

    // แกนคะแนนคำนวณจากข้อมูลจริง (รวม centroid) ไม่ใช่ช่วงตายตัว — สินค้าที่ยังไม่มีรีวิว
    // จะมี rating 0 ถ้าตรึงแกนไว้ที่ 3.5-5.0 จุดพวกนี้จะถูกวาดนอกพื้นที่ SVG แล้วโดนตัดทิ้ง
    // หายไปจากกราฟเงียบ ๆ โดยไม่มีสัญญาณเตือน
    const ratings = [
      ...products.map((product) => product.rating),
      ...clusters.map((cluster) => cluster.centroid.rating),
    ];
    const rawMinRating = Math.min(...ratings);
    const rawMaxRating = Math.max(...ratings);
    const ratingPadding = rawMaxRating === rawMinRating ? 0.5 : (rawMaxRating - rawMinRating) * 0.08;
    const minRating = Math.max(RATING_FLOOR, rawMinRating - ratingPadding);
    const maxRating = Math.min(RATING_CEILING, rawMaxRating + ratingPadding);
    const ratingSpan = maxRating - minRating || 1;

    const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
    const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const xFor = (price: number) =>
      PADDING_LEFT + ((Math.log1p(price) - minLog) / (maxLog - minLog)) * chartWidth;
    const yFor = (rating: number) =>
      PADDING_TOP + ((maxRating - rating) / ratingSpan) * chartHeight;
    const ticks = Array.from({ length: 4 }, (_, index) =>
      Math.expm1(minLog + ((maxLog - minLog) * index) / 3)
    );
    const ratingTicks = [minRating, (minRating + maxRating) / 2, maxRating];
    return { chartWidth, chartHeight, xFor, yFor, ticks, ratingTicks };
  }, [clusters, products, width]);

  const colorFor = (color: ClusterColorKey) => Brand[color];
  const dotStyleFor = (color: ClusterColorKey) => styles[`dot_${color}`];

  return (
    <View style={styles.container} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      <Svg width="100%" height={HEIGHT} accessibilityLabel="กราฟกระจายราคาและคะแนนรีวิว">
        <Line x1={PADDING_LEFT} y1={PADDING_TOP} x2={PADDING_LEFT} y2={PADDING_TOP + chart.chartHeight} stroke={Brand.divider} strokeWidth={2} />
        <Line x1={PADDING_LEFT} y1={PADDING_TOP + chart.chartHeight} x2={PADDING_LEFT + chart.chartWidth} y2={PADDING_TOP + chart.chartHeight} stroke={Brand.divider} strokeWidth={2} />
        {chart.ratingTicks.map((rating, index) => (
          <SvgText key={index} x={PADDING_LEFT - 7} y={chart.yFor(rating) + 3} textAnchor="end" fontSize={9} fontFamily={PixelFonts.bodyRegular} fill={Brand.textSecondary}>
            {rating.toFixed(1)}
          </SvgText>
        ))}
        {chart.ticks.map((price, index) => (
          <SvgText key={index} x={chart.xFor(price)} y={HEIGHT - 19} textAnchor="middle" fontSize={8} fontFamily={PixelFonts.bodyRegular} fill={Brand.textSecondary}>
            {formatBaht(Math.max(0, Math.round(price)))}
          </SvgText>
        ))}
        <SvgText x={PADDING_LEFT + chart.chartWidth / 2} y={HEIGHT - 3} textAnchor="middle" fontSize={10} fontFamily={PixelFonts.bodySemiBold} fill={Brand.text}>
          ราคา (สเกลลอการิทึม)
        </SvgText>
        {/* หมุนด้วย attribute transform ของ SVG โดยตรง ไม่ใช้ rotation/originX/originY
            เพราะบน react-native-web คู่ originX/originY ถูกแปลงเป็น transform-origin
            ซึ่ง React DOM ไม่รู้จัก (ขึ้น Invalid DOM property) แล้วโดนตัดทิ้ง
            ป้ายจึงหมุนรอบจุด (0,0) แทนที่จะหมุนรอบตัวเอง */}
        <SvgText
          x={11}
          y={PADDING_TOP + chart.chartHeight / 2}
          textAnchor="middle"
          fontSize={10}
          fontFamily={PixelFonts.bodySemiBold}
          fill={Brand.text}
          transform={`rotate(-90 11 ${PADDING_TOP + chart.chartHeight / 2})`}>
          คะแนนรีวิว
        </SvgText>
        {products.map((product) => {
          const cluster = clusterById.get(product.clusterId);
          return cluster ? (
            <Circle key={product.id} cx={chart.xFor(product.price)} cy={chart.yFor(product.rating)} r={5} fill={colorFor(cluster.color)} stroke={Brand.divider} strokeWidth={1.5} />
          ) : null;
        })}
        {clusters.map((cluster) => {
          const x = chart.xFor(cluster.centroid.price);
          const y = chart.yFor(cluster.centroid.rating);
          return (
            <G key={cluster.id}>
              <Line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} stroke={colorFor(cluster.color)} strokeWidth={4} />
              <Line x1={x - 7} y1={y + 7} x2={x + 7} y2={y - 7} stroke={colorFor(cluster.color)} strokeWidth={4} />
            </G>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        {clusters.map((cluster) => (
          <View key={cluster.id} style={styles.legendItem}>
            <View style={[styles.dot, dotStyleFor(cluster.color)]} />
            <Text style={styles.legendLabel}>{cluster.label}</Text>
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
    paddingBottom: 12,
  },
  legend: {
    paddingHorizontal: 12,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: Brand.divider,
  },
  dot_skyBlue: { backgroundColor: Brand.skyBlue },
  dot_mint: { backgroundColor: Brand.mint },
  dot_tan: { backgroundColor: Brand.tan },
  dot_saleBg: { backgroundColor: Brand.saleBg },
  dot_coin: { backgroundColor: Brand.coin },
  dot_orange: { backgroundColor: Brand.orange },
  legendLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
});
