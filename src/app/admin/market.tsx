import { useRouter } from 'expo-router';
import { AlertTriangle, RefreshCw, Store } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { marketApi } from '@/api/market';
import { MarketScatter } from '@/components/admin/market-scatter';
import { ShareBar, type ShareSegment } from '@/components/admin/share-bar';
import { StatTile } from '@/components/admin/stat-tile';
import { AdminGuard } from '@/components/shop/admin-guard';
import { PressableScale } from '@/components/shop/pressable-scale';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { ClusterPalette, PixelBorder, PixelFonts, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useBrand } from '@/store/theme-store';
import type { ClusterColorKey } from '@/types/analytics';
import type { MarketAnalysis, MarketCluster, MarketMode, StoreProfile } from '@/types/market';
import { formatBaht } from '@/utils/format';

const MODES: { value: MarketMode; label: string; hint: string }[] = [
  {
    value: 'relative',
    label: 'เทียบในร้านตัวเอง',
    hint: 'จัดกลุ่มจากตำแหน่งราคาภายในร้านของแต่ละเจ้า ทำให้เทียบข้ามร้านที่ขายของคนละระดับราคาได้',
  },
  {
    value: 'absolute',
    label: 'ราคาจริงทั้งตลาด',
    hint: 'จัดกลุ่มจากตัวเลขราคาตรง ๆ กลุ่มบนจะเป็นสินค้าราคาสูงของตลาดรวม',
  },
];

/** สีประจำชั้นต้องตรงกันทุกที่ในหน้า ไม่งั้นแถบสัดส่วนกับการ์ดจะสื่อคนละเรื่อง */
const tierColor = (tierIndex: number): ClusterColorKey =>
  ClusterPalette[tierIndex % ClusterPalette.length];

export default function AdminMarketScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const { token, isAdminSession } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<MarketMode>('relative');
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    if (!token || !isAdminSession) return;
    let active = true;
    setLoading(true);
    setError(null);

    marketApi.getMarketClusters(token, mode)
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
  }, [isAdminSession, mode, reloadNonce, showToast, token]);

  const failedSources = useMemo(
    () => (data?.sources ?? []).filter((source) => source.status === 'failed'),
    [data]
  );

  const renderModeSwitch = useCallback(
    () => (
      <View style={styles.modeBlock}>
        <View style={styles.modeRow}>
          {MODES.map((option) => (
            <PressableScale
              key={option.value}
              accessibilityRole="button"
              style={[styles.modeButton, mode === option.value && styles.modeButtonActive]}
              onPress={() => setMode(option.value)}>
              <Text style={[styles.modeText, mode === option.value && styles.modeTextActive]}>
                {option.label}
              </Text>
            </PressableScale>
          ))}
        </View>
        <Text style={styles.modeHint}>{MODES.find((m) => m.value === mode)?.hint}</Text>
      </View>
    ),
    [mode, styles]
  );

  const content = () => {
    if (loading && !data) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color={Brand.text} />
          <Text style={styles.stateText}>กำลังดึงสินค้าจากทุกร้าน...</Text>
        </View>
      );
    }

    if (error && !data) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>โหลดข้อมูลไม่สำเร็จ</Text>
          <Text style={styles.stateText}>{error}</Text>
          <PressableScale
            accessibilityRole="button"
            style={styles.primaryButton}
            onPress={() => setReloadNonce((value) => value + 1)}>
            <RefreshCw size={17} color={Brand.onAccent} strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>ลองอีกครั้ง</Text>
          </PressableScale>
        </View>
      );
    }

    if (!data) return null;

    if (data.status === 'insufficient_data') {
      return (
        <ScrollView contentContainerStyle={styles.content}>
          {renderModeSwitch()}
          <View style={styles.centerState}>
            <Text style={styles.stateTitle}>ข้อมูลยังไม่พอสำหรับจัดกลุ่ม</Text>
            <Text style={styles.stateText}>{data.message}</Text>
          </View>
          <SourceList sources={data.sources} />
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderModeSwitch()}

        {failedSources.length > 0 ? (
          <View style={styles.warning}>
            <AlertTriangle size={16} color={Brand.onPastel} strokeWidth={2.5} />
            <Text style={styles.warningText}>
              วิเคราะห์จาก {data.storeCount} ร้าน — ดึงข้อมูลไม่ได้{' '}
              {failedSources.map((source) => source.name).join(', ')} (เซิร์ฟเวอร์ปลายทางไม่ตอบสนอง)
            </Text>
          </View>
        ) : null}

        <SectionTitle title="ภาพรวมตลาดรวม" />
        <View style={styles.kpiGrid}>
          <StatTile
            label="สินค้าทั้งหมด"
            value={data.productCount.toLocaleString('th-TH')}
            detail={`จาก ${data.storeCount} ร้านในกลุ่ม`}
          />
          <StatTile
            label="จำนวนกลุ่ม"
            value={data.k.toLocaleString('th-TH')}
            detail={`แบ่งด้วยราคาอย่างเดียว`}
          />
          <StatTile
            label="ความชัดของกลุ่ม"
            value={data.silhouette.toFixed(2)}
            detail="Silhouette ยิ่งเข้าใกล้ 1 ยิ่งแยกกลุ่มชัด"
          />
          <StatTile
            label="เกณฑ์ที่ใช้"
            value={data.mode === 'relative' ? 'ในร้าน' : 'ทั้งตลาด'}
            detail={data.modeLabel}
          />
        </View>

        <SectionTitle title="กลุ่มราคาและสัดส่วนของแต่ละร้าน" />
        <View style={styles.list}>
          {data.clusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </View>

        <SectionTitle title="ผลการจัดกลุ่มของ K-Means" />
        <MarketScatter
          products={data.products}
          clusters={data.clusters}
          storeProfiles={data.storeProfiles}
          mode={data.mode}
        />

        <SectionTitle title="ตำแหน่งของแต่ละร้าน" />
        <View style={styles.list}>
          {data.storeProfiles.map((profile) => (
            <StoreCard key={profile.storeId} profile={profile} />
          ))}
        </View>

        <SectionTitle title="สถานะการเชื่อมต่อ" />
        <SourceList sources={data.sources} />

        <PressableScale
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => router.push('/admin/dashboard')}>
          <Text style={styles.secondaryButtonText}>ไปแดชบอร์ดสินค้าของเรา</Text>
        </PressableScale>
      </ScrollView>
    );
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="เทียบราคาข้ามร้าน" showBack />
      <AdminGuard>{content()}</AdminGuard>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const styles = useStyles(makeStyles);
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ClusterCard({ cluster }: { cluster: MarketCluster }) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const color = tierColor(cluster.tierIndex);

  return (
    <View style={styles.card}>
      <View style={[styles.strip, { backgroundColor: Brand[color] }]} />
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>{cluster.label}</Text>
          <Text style={styles.cardMeta}>{cluster.size.toLocaleString('th-TH')} ชิ้น</Text>
        </View>
        <Text style={styles.priceRange}>
          {formatBaht(Math.round(cluster.priceRange[0]))} – {formatBaht(Math.round(cluster.priceRange[1]))}
        </Text>
        <Text style={styles.cardMeta}>
          เฉลี่ย {formatBaht(Math.round(cluster.avgPrice))} · มัธยฐาน{' '}
          {formatBaht(Math.round(cluster.medianPrice))}
        </Text>

        <View style={styles.breakdown}>
          {cluster.storeBreakdown.map((entry) => (
            <View key={entry.storeId} style={styles.breakdownRow}>
              <Text style={styles.breakdownName} numberOfLines={1}>
                {entry.storeName}
              </Text>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownFill,
                    { width: `${Math.max(3, entry.share * 100)}%`, backgroundColor: Brand[color] },
                  ]}
                />
              </View>
              <Text style={styles.breakdownValue}>
                {entry.count} · {Math.round(entry.share * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function StoreCard({ profile }: { profile: StoreProfile }) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();

  const segments: ShareSegment[] = profile.distribution.map((tier) => ({
    key: `${profile.storeId}-${tier.tierIndex}`,
    value: tier.count,
    color: tierColor(tier.tierIndex),
  }));

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <View style={styles.storeNameRow}>
            <Store size={15} color={Brand.textSecondary} strokeWidth={2} />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {profile.storeName}
            </Text>
          </View>
          <Text style={styles.cardMeta}>{profile.productCount.toLocaleString('th-TH')} ชิ้น</Text>
        </View>

        <Text style={styles.highlight}>
          ส่วนใหญ่เป็น “{profile.dominantTierLabel}” {Math.round(profile.dominantShare * 100)}%
        </Text>
        <Text style={styles.cardMeta}>
          ราคา {formatBaht(Math.round(profile.minPrice))} – {formatBaht(Math.round(profile.maxPrice))} ·
          มัธยฐาน {formatBaht(Math.round(profile.medianPrice))}
        </Text>

        <ShareBar segments={segments} />
        <View style={styles.legendRow}>
          {profile.distribution.map((tier) => (
            <View key={tier.tierIndex} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Brand[tierColor(tier.tierIndex)] }]} />
              <Text style={styles.legendText}>
                {tier.label} {tier.count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function SourceList({ sources }: { sources: MarketAnalysis['sources'] }) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();

  return (
    <View style={styles.sourceTable}>
      {sources.map((source) => (
        <View key={source.id} style={styles.sourceRow}>
          <View
            style={[
              styles.sourceDot,
              { backgroundColor: source.status === 'ok' ? Brand.successBg : Brand.danger },
            ]}
          />
          <View style={styles.sourceBody}>
            <Text style={styles.sourceName} numberOfLines={1}>
              {source.name}
            </Text>
            <Text style={styles.sourceMeta} numberOfLines={2}>
              {source.status === 'ok'
                ? `${source.kind} · ${source.productCount.toLocaleString('th-TH')} ชิ้น`
                : `${source.kind} · ดึงไม่ได้ (${source.error ?? 'ไม่ทราบสาเหตุ'})`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 16 },
  centerState: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 48, paddingHorizontal: 24 },
  stateTitle: { fontSize: 17, fontFamily: PixelFonts.headingBold, color: Brand.text, textAlign: 'center' },
  stateText: { fontSize: 13, lineHeight: 20, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary, textAlign: 'center' },
  primaryButton: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Brand.accent, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  primaryButtonText: { fontSize: 13, fontFamily: PixelFonts.headingBold, color: Brand.onAccent },
  secondaryButton: { alignItems: 'center', paddingVertical: 13, backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  secondaryButtonText: { fontSize: 12, fontFamily: PixelFonts.headingSemiBold, color: Brand.text },

  modeBlock: { gap: 8 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 11, paddingHorizontal: 8, backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  modeButtonActive: { backgroundColor: Brand.accent },
  modeText: { fontSize: 11, fontFamily: PixelFonts.bodySemiBold, color: Brand.text, textAlign: 'center' },
  modeTextActive: { color: Brand.onAccent },
  modeHint: { fontSize: 11, lineHeight: 17, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },

  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, backgroundColor: Brand.tan, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  warningText: { flex: 1, fontSize: 11, lineHeight: 17, fontFamily: PixelFonts.bodySemiBold, color: Brand.onPastel },

  sectionTitle: { marginTop: 4, fontSize: 17, fontFamily: PixelFonts.headingBold, color: Brand.text },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  list: { gap: 12 },

  card: { backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  strip: { height: 10, borderBottomWidth: PixelBorder.base, borderBottomColor: Brand.divider },
  cardBody: { padding: 13, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  storeNameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: PixelFonts.headingBold, color: Brand.text },
  cardMeta: { fontSize: 11, lineHeight: 17, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  priceRange: { fontSize: 15, fontFamily: PixelFonts.headingSemiBold, color: Brand.text },
  highlight: { fontSize: 13, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },

  breakdown: { marginTop: 2, gap: 6 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownName: { width: 96, fontSize: 10, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
  breakdownBar: { flex: 1, height: 12, backgroundColor: Brand.surfaceDeep, borderWidth: PixelBorder.thin, borderColor: Brand.divider },
  breakdownFill: { height: '100%' },
  breakdownValue: { width: 62, textAlign: 'right', fontSize: 10, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },

  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderWidth: 1, borderColor: Brand.divider },
  legendText: { fontSize: 10, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },

  sourceTable: { backgroundColor: Brand.surface, borderWidth: PixelBorder.base, borderColor: Brand.divider },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: PixelBorder.thin, borderBottomColor: Brand.divider },
  sourceDot: { width: 10, height: 10, borderWidth: 1, borderColor: Brand.divider },
  sourceBody: { flex: 1, gap: 2 },
  sourceName: { fontSize: 12, fontFamily: PixelFonts.bodySemiBold, color: Brand.text },
  sourceMeta: { fontSize: 10, lineHeight: 15, fontFamily: PixelFonts.bodyRegular, color: Brand.textSecondary },
});
