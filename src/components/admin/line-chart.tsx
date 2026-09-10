import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';

interface ChartPoint {
  x: number;
  y: number;
}

interface Props {
  points: ChartPoint[];
  highlightX: number;
  yLabel: string;
}

const HEIGHT = 190;
const PADDING_LEFT = 48;
const PADDING_RIGHT = 16;
const PADDING_TOP = 22;
const PADDING_BOTTOM = 38;

export function LineChart({ points, highlightX, yLabel }: Props) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const [width, setWidth] = useState(320);

  const layout = useMemo(() => {
    const values = points.map((point) => point.y);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const padding = rawMax === rawMin ? Math.max(Math.abs(rawMax) * 0.1, 1) : (rawMax - rawMin) * 0.12;
    const minY = rawMin - padding;
    const maxY = rawMax + padding;
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
    const chartHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const xFor = (x: number) => PADDING_LEFT + ((x - minX) / Math.max(1, maxX - minX)) * chartWidth;
    const yFor = (y: number) => PADDING_TOP + ((maxY - y) / Math.max(Number.EPSILON, maxY - minY)) * chartHeight;
    return { minY, maxY, chartWidth, chartHeight, xFor, yFor };
  }, [points, width]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const polylinePoints = points.map((point) => `${layout.xFor(point.x)},${layout.yFor(point.y)}`).join(' ');

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Text style={styles.title}>{yLabel}</Text>
      <Svg width="100%" height={HEIGHT} accessibilityLabel={`กราฟ ${yLabel}`}>
        <Line x1={PADDING_LEFT} y1={PADDING_TOP} x2={PADDING_LEFT} y2={PADDING_TOP + layout.chartHeight} stroke={Brand.divider} strokeWidth={2} />
        <Line x1={PADDING_LEFT} y1={PADDING_TOP + layout.chartHeight} x2={PADDING_LEFT + layout.chartWidth} y2={PADDING_TOP + layout.chartHeight} stroke={Brand.divider} strokeWidth={2} />
        <SvgText x={PADDING_LEFT - 6} y={PADDING_TOP + 4} textAnchor="end" fontSize={9} fontFamily={PixelFonts.bodyRegular} fill={Brand.textSecondary}>
          {layout.maxY.toFixed(2)}
        </SvgText>
        <SvgText x={PADDING_LEFT - 6} y={PADDING_TOP + layout.chartHeight + 3} textAnchor="end" fontSize={9} fontFamily={PixelFonts.bodyRegular} fill={Brand.textSecondary}>
          {layout.minY.toFixed(2)}
        </SvgText>
        <Polyline points={polylinePoints} fill="none" stroke={Brand.text} strokeWidth={2} />
        {points.map((point) => {
          const highlighted = point.x === highlightX;
          return (
            <Circle
              key={point.x}
              cx={layout.xFor(point.x)}
              cy={layout.yFor(point.y)}
              r={highlighted ? 6 : 4}
              fill={highlighted ? Brand.accent : Brand.surface}
              stroke={Brand.divider}
              strokeWidth={2}
            />
          );
        })}
        {points.map((point) => (
          <SvgText key={`tick-${point.x}`} x={layout.xFor(point.x)} y={HEIGHT - 18} textAnchor="middle" fontSize={10} fontFamily={PixelFonts.bodyRegular} fill={Brand.textSecondary}>
            {point.x}
          </SvgText>
        ))}
        <SvgText x={PADDING_LEFT + layout.chartWidth / 2} y={HEIGHT - 3} textAnchor="middle" fontSize={10} fontFamily={PixelFonts.bodySemiBold} fill={Brand.text}>
          จำนวนกลุ่ม (k)
        </SvgText>
        <SvgText x={layout.xFor(highlightX)} y={Math.max(12, layout.yFor(points.find((point) => point.x === highlightX)?.y ?? 0) - 10)} textAnchor="middle" fontSize={10} fontFamily={PixelFonts.bodySemiBold} fill={Brand.text}>
          {`k=${highlightX}`}
        </SvgText>
      </Svg>
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  container: {
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
    paddingTop: 10,
  },
  title: {
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.text,
  },
});
