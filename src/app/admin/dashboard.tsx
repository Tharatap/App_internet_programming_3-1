import { useRouter, type Href } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, Plus, RefreshCw } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { analyticsApi } from '@/api/analytics';
import { ApiError } from '@/api/client';
import { ClusterScatter } from '@/components/admin/cluster-scatter';
import { LineChart } from '@/components/admin/line-chart';
import { StatTile } from '@/components/admin/stat-tile';
import { AdminGuard } from '@/components/shop/admin-guard';
import { PressableScale } from '@/components/shop/pressable-scale';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { ClusterPalette, PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useBrand } from '@/store/theme-store';
import type { ClusterAnalysis, ClusterColorKey, ProductCluster } from '@/types/analytics';
import { formatBaht } from '@/utils/format';

export default function AdminDashboardScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const { token, isAdminSession } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<ClusterAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedK, setSelectedK] = useState<number | undefined>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    if (!token || !isAdminSession) return;
    let active = true;
    setLoading(true);
    setError(null);

    analyticsApi.getProductClusters(token, selectedK)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof ApiError
          ? caught.message
          : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่';
        setError(message);
        showToast(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdminSession, reloadNonce, selectedK, showToast, token]);

  const sortedProducts = useMemo(() => {
    if (!data || data.status !== 'ok') return [];
    const tierByCluster = new Map(data.clusters.map((cluster) => [cluster.id, cluster.tierIndex]));
    return [...data.products].sort((a, b) =>
      (tierByCluster.get(a.clusterId) ?? 0) - (tierByCluster.get(b.clusterId) ?? 0)
      || a.price - b.price
    );
  }, [data]);

  const colorStyleFor = (color: ClusterColorKey) => styles[`cluster_${color}`];

  const content = () => {
    if (loading && !data) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color={Brand.text} />
          <Text style={styles.stateText}>กำลังวิเคราะห์สินค้า...</Text>
        </View>
      );
    }

    if (error && !data) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>โหลดผลวิเคราะห์ไม่สำเร็จ</Text>
          <Text style={styles.stateText}>{error}</Text>
          <PressableScale style={styles.primaryButton} onPress={() => setReloadNonce((value) => value + 1)}>
            <RefreshCw size={17} color={Brand.onAccent} strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>ลองอีกครั้ง</Text>
          </PressableScale>
        </View>
      );
    }

    if (!data) return null;

    if (data.status === 'insufficient_data') {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>ข้อมูลยังไม่พอสำหรับจัดกลุ่ม</Text>
          <Text style={styles.stateText}>{data.message}</Text>
          <PressableScale style={styles.primaryButton} onPress={() => router.push('/admin/product-form')}>
            <Plus size={18} color={Brand.onAccent} strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>ไปเพิ่มสินค้า</Text>
          </PressableScale>
        </View>
      );
    }

    // ผูกสีกับ tier ซ้ำฝั่งหน้าจอเพื่อให้ข้อมูลจาก API ที่เก่ากว่ายังไม่ทำให้ palette ล้น
    const visibleClusters = data.clusters.map((cluster) => ({
      ...cluster,
      color: ClusterPalette[cluster.tierIndex % ClusterPalette.length],
    }));
    const clusterById = new Map(visibleClusters.map((cluster) => [cluster.id, cluster]));

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!data.kSelection.reliable ? (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              วิเคราะห์จากสินค้า {data.productCount.toLocaleString('th-TH')} รายการ ผลอาจเปลี่ยนเมื่อเพิ่มสินค้า
            </Text>
          </View>
        ) : null}

        <SectionTitle title="ภาพรวมสินค้า" />
        <View style={styles.kpiGrid}>
          <StatTile label="สินค้าทั้งหมด" value={data.kpis.productCount.toLocaleString('th-TH')} detail="รายการในระบบ" />
          <StatTile label="จำนวนกลุ่ม" value={data.kpis.clusterCount.toLocaleString('th-TH')} detail="เลือกจากค่า Silhouette" />
          <StatTile label="ราคาเฉลี่ย" value={formatBaht(Math.round(data.kpis.avgPrice))} detail={`มัธยฐาน ${formatBaht(Math.round(data.kpis.medianPrice))}`} />
          <StatTile
            label="คะแนนเฉลี่ย"
            value={data.kpis.avgRating === null ? 'ยังไม่มี' : data.kpis.avgRating.toFixed(1)}
            detail={
              data.kpis.noReviewCount > 0
                ? `รีวิวรวม ${data.kpis.totalReviews.toLocaleString('th-TH')} ครั้ง · ยังไม่มีรีวิว ${data.kpis.noReviewCount.toLocaleString('th-TH')} รายการ`
                : `รีวิวรวม ${data.kpis.totalReviews.toLocaleString('th-TH')} ครั้ง`
            }
          />
          <StatTile label="สินค้าที่ลดราคา" value={data.kpis.discountedCount.toLocaleString('th-TH')} detail={`Flash Sale ${data.kpis.flashSaleCount.toLocaleString('th-TH')} รายการ`} />
          <StatTile label="สินค้าหมดสต๊อก" value={data.kpis.outOfStockCount.toLocaleString('th-TH')} detail="ควรตรวจสต๊อกก่อนจัดโปร" />
        </View>

        <SectionTitle title="ข้อเสนอโปรโมชันตามกลุ่ม" />
        <View style={styles.clusterList}>
          {visibleClusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} colorStyle={colorStyleFor(cluster.color)} />
          ))}
        </View>

        <SectionTitle title="ราคาเทียบคะแนนรีวิว" />
        <ClusterScatter products={data.products} clusters={visibleClusters} />

        <SectionTitle title="สินค้ารายตัว" />
        <View style={styles.productTable}>
          {sortedProducts.map((product) => {
            const cluster = clusterById.get(product.clusterId);
            return (
              <PressableScale key={product.id} style={styles.productRow} onPress={() => router.push(`/admin/product-form?id=${product.id}`)} accessibilityLabel={`แก้ไขสินค้า ${product.name}`}>
                {cluster ? <View style={[styles.productDot, colorStyleFor(cluster.color)]} /> : null}
                <View style={styles.productBody}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productMeta}>{formatBaht(product.price)} · คะแนน {product.rating.toFixed(1)}</Text>
                </View>
                <ChevronRight size={18} color={Brand.textMuted} strokeWidth={2} />
              </PressableScale>
            );
          })}
        </View>

        <PressableScale
          accessibilityRole="button"
          style={styles.detailsToggle}
          onPress={() => router.push('/admin/market' as Href)}>
          <Text style={styles.detailsToggleText}>เทียบราคากับร้านอื่นในกลุ่ม</Text>
          <ChevronRight size={20} color={Brand.text} strokeWidth={2} />
        </PressableScale>

        <PressableScale style={styles.detailsToggle} onPress={() => setDetailsOpen((open) => !open)}>
          <Text style={styles.detailsToggleText}>รายละเอียด ML</Text>
          {detailsOpen
            ? <ChevronUp size={20} color={Brand.text} strokeWidth={2} />
            : <ChevronDown size={20} color={Brand.text} strokeWidth={2} />}
        </PressableScale>

        {detailsOpen ? (
          <View style={styles.detailsBody}>
            <Text style={styles.detailHeading}>เลือกจำนวนกลุ่ม</Text>
            <View style={styles.kButtons}>
              <PressableScale style={[styles.kButton, selectedK === undefined && styles.kButtonActive]} onPress={() => setSelectedK(undefined)}>
                <Text style={[styles.kButtonText, selectedK === undefined && styles.kButtonTextActive]}>อัตโนมัติ</Text>
              </PressableScale>
              {data.kSelection.range.map((k) => (
                <PressableScale key={k} style={[styles.kButton, selectedK === k && styles.kButtonActive]} onPress={() => setSelectedK(k)}>
                  <Text style={[styles.kButtonText, selectedK === k && styles.kButtonTextActive]}>k={k}</Text>
                </PressableScale>
              ))}
            </View>
            {loading ? <Text style={styles.refreshingText}>กำลังคำนวณใหม่...</Text> : null}
            <LineChart points={data.kSelection.candidates.map((candidate) => ({ x: candidate.k, y: candidate.inertia }))} highlightX={data.chosenK} yLabel="Elbow (ความคลาดเคลื่อนรวม)" />
            <LineChart points={data.kSelection.candidates.map((candidate) => ({ x: candidate.k, y: candidate.silhouette }))} highlightX={data.chosenK} yLabel="Silhouette (ยิ่งสูงยิ่งแยกกลุ่มชัด)" />
            <Text style={styles.detailHeading}>คุณลักษณะที่ใช้</Text>
            <View style={styles.featureList}>
              {data.features.map((feature) => (
                <View key={feature.key} style={styles.featureRow}>
                  <Text style={styles.featureName}>{feature.label}{feature.transform === 'log' ? ' (log1p)' : ''}</Text>
                  <Text style={styles.featureStats}>เฉลี่ย {feature.mean.toFixed(2)} · SD {feature.std.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    );
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="แดชบอร์ดวิเคราะห์สินค้า" showBack />
      <AdminGuard>{content()}</AdminGuard>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const styles = useStyles(makeStyles);
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ClusterCard({ cluster, colorStyle }: { cluster: ProductCluster; colorStyle: object }) {
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.clusterCard}>
      <View style={[styles.clusterStrip, colorStyle]} />
      <View style={styles.clusterContent}>
        <View style={styles.clusterTitleRow}>
          <Text style={styles.clusterTitle}>{cluster.label}</Text>
          <Text style={styles.clusterSize}>{cluster.size.toLocaleString('th-TH')} รายการ</Text>
        </View>
        <Text style={styles.priceRange}>{formatBaht(Math.round(cluster.summary.minPrice))} – {formatBaht(Math.round(cluster.summary.maxPrice))}</Text>
        <View style={styles.chipRow}>
          <Text style={styles.chip}>
            {cluster.summary.avgRating === null
              ? 'ยังไม่มีรีวิว'
              : `คะแนน ${cluster.summary.avgRating.toFixed(1)}${
                  cluster.summary.ratedCount < cluster.size
                    ? ` (จาก ${cluster.summary.ratedCount}/${cluster.size} ที่มีรีวิว)`
                    : ''
                }`}
          </Text>
          <Text style={styles.chip}>ลดเฉลี่ย {cluster.summary.avgDiscountPct.toFixed(1)}%</Text>
          <Text style={styles.chip}>ประหยัดไฟ {cluster.summary.avgEnergySaving.toFixed(1)}%</Text>
        </View>
        <Text style={styles.groupMeta}>หมวดเด่น: {cluster.summary.topCategories.map((item) => `${item.name} (${item.count})`).join(', ')}</Text>
        <Text style={styles.groupMeta}>แบรนด์เด่น: {cluster.summary.topBrands.map((item) => `${item.name} (${item.count})`).join(', ')}</Text>
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationHeading}>ข้อเสนอโปรโมชัน</Text>
          {cluster.recommendations.map((recommendation) => (
            <View key={recommendation.title} style={styles.recommendationRow}>
              <View style={[styles.priorityDot, recommendation.priority === 'high' ? styles.priorityHigh : styles.priorityNormal]} />
              <View style={styles.recommendationBody}>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 16 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  stateTitle: { fontSize: 17, fontFamily: PixelFonts.headingBold, color: Brand.text, textAlign: 'center' },
  stateText: { fontSize: 13, lineHeight: 20, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary, textAlign: 'center' },
  primaryButton: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Brand.accent, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  primaryButtonText: { fontSize: 13, fontFamily: PixelFonts.headingBold, color: Brand.onAccent },
  warning: { padding: 12, backgroundColor: Brand.tan, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  warningText: { fontSize: 12, lineHeight: 18, fontFamily: PixelFonts.bodySemiBold, color: Brand.onPastel },
  sectionTitle: { marginTop: 4, fontSize: 17, fontFamily: PixelFonts.headingBold, color: Brand.text },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  clusterList: { gap: 14 },
  clusterCard: { backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  clusterStrip: { height: 10, borderBottomWidth: PixelBorder.base, borderBottomColor: Brand.divider },
  clusterContent: { padding: 14, gap: 9 },
  clusterTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  clusterTitle: { flex: 1, fontSize: 16, fontFamily: PixelFonts.headingBold, color: Brand.text },
  clusterSize: { fontSize: 11, fontFamily: PixelFonts.bodySemiBold, color: Brand.textSecondary },
  priceRange: { fontSize: 15, fontFamily: PixelFonts.headingSemiBold, color: Brand.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontFamily: PixelFonts.bodySemiBold, color: Brand.text, backgroundColor: Brand.surfaceDeep, borderWidth: PixelBorder.thin, borderColor: Brand.divider },
  groupMeta: { fontSize: 11, lineHeight: 17, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  recommendationBox: { marginTop: 3, padding: 11, gap: 9, backgroundColor: Brand.selectedBg, borderWidth: PixelBorder.thin, borderColor: Brand.divider },
  recommendationHeading: { fontSize: 13, fontFamily: PixelFonts.headingBold, color: Brand.text },
  recommendationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  priorityDot: { width: 8, height: 8, marginTop: 5, borderWidth: 1, borderColor: Brand.divider },
  priorityHigh: { backgroundColor: Brand.danger },
  priorityNormal: { backgroundColor: Brand.accent },
  recommendationBody: { flex: 1, gap: 2 },
  recommendationTitle: { fontSize: 12, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },
  recommendationReason: { fontSize: 10, lineHeight: 16, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  productTable: { backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  productRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: PixelBorder.thin, borderBottomColor: Brand.divider },
  productDot: { width: 12, height: 12, borderWidth: 1, borderColor: Brand.divider },
  productBody: { flex: 1, gap: 3 },
  productName: { fontSize: 12, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },
  productMeta: { fontSize: 10, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  detailsToggleText: { fontSize: 14, fontFamily: PixelFonts.headingBold, color: Brand.text },
  detailsBody: { gap: 12 },
  detailHeading: { fontSize: 13, fontFamily: PixelFonts.headingSemiBold, color: Brand.text },
  kButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kButton: { paddingHorizontal: 11, paddingVertical: 8, backgroundColor: Brand.surface, borderWidth: PixelBorder.thin, borderColor: Brand.divider },
  kButtonActive: { backgroundColor: Brand.accent },
  kButtonText: { fontSize: 11, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },
  kButtonTextActive: { color: Brand.onAccent },
  refreshingText: { fontSize: 11, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  featureList: { backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  featureRow: { padding: 10, gap: 2, borderBottomWidth: PixelBorder.thin, borderBottomColor: Brand.divider },
  featureName: { fontSize: 12, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },
  featureStats: { fontSize: 10, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  cluster_skyBlue: { backgroundColor: Brand.skyBlue },
  cluster_mint: { backgroundColor: Brand.mint },
  cluster_tan: { backgroundColor: Brand.tan },
  cluster_saleBg: { backgroundColor: Brand.saleBg },
  cluster_coin: { backgroundColor: Brand.coin },
  cluster_orange: { backgroundColor: Brand.orange },
});
