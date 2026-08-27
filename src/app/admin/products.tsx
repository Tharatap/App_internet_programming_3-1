import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { catalogApi } from '@/api/catalog';
import { AdminGuard } from '@/components/shop/admin-guard';
import { DeleteConfirmModal } from '@/components/shop/delete-confirm-modal';
import { PressableScale } from '@/components/shop/pressable-scale';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { PixelBorder, PixelFonts, Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useCatalog } from '@/store/catalog-store';
import { useBrand } from '@/store/theme-store';
import { Product } from '@/types/product';
import { formatBaht } from '@/utils/format';

/**
 * หน้ารายการสินค้าสำหรับแอดมิน — ดู / กดเพื่อแก้ไข / ลบ
 *
 * กันการเข้าถึงด้วย AdminGuard (เช็ค isAdminSession) และ endpoint ที่เรียกถูกกันด้วย
 * adminOnly ฝั่ง server อีกชั้น → ซ่อนปุ่มอย่างเดียวไม่พอ ต้องกันที่ API ด้วยเสมอ
 */
export default function AdminProductsScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useAuth();
  const { showToast } = useToast();
  const { products, categories, refresh } = useCatalog();

  // เก็บสินค้าที่กำลังจะลบไว้ — ค่าไม่ null เมื่อไหร่ = เปิด modal ยืนยัน
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** แปลง categoryId เป็นชื่อหมวดภาษาไทย (ถ้าหาไม่เจอให้โชว์ id ไปก่อน) */
  const categoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? categoryId;

  /** ลบสินค้า — เรียกจาก DeleteConfirmModal หลังผู้ใช้พิมพ์ "Confirm Delete" ยืนยันแล้ว */
  const onDeleteConfirm = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await catalogApi.deleteProduct(token, deleteTarget.id);
      // โหลดสินค้าใหม่ทั้งชุด ให้ทุกหน้าในแอปเห็นตรงกัน
      refresh();
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'ลบสินค้าไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`เปิดหน้าแก้ไข ${item.name}`}
        style={styles.cardMain}
        onPress={() => router.push(`/admin/product-form?id=${item.id}`)}>
        <SkeletonImage uri={item.images[0]} style={styles.image} borderRadius={Radius.md} />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.meta}>
            {categoryName(item.categoryId)} · {formatBaht(item.price)}
          </Text>
        </View>
        <Text style={styles.editLabel}>แก้ไข</Text>
      </PressableScale>
      <PressableScale
        style={styles.deleteIconButton}
        onPress={() => setDeleteTarget(item)}
        accessibilityLabel={`ลบ ${item.name}`}>
        <Trash2 size={18} color={Brand.danger} strokeWidth={2} />
      </PressableScale>
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="จัดการสินค้า" showBack />
      <AdminGuard>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <PressableScale
              accessibilityRole="button"
              style={styles.addRow}
              onPress={() => router.push('/admin/product-form')}>
              <Plus size={18} color={Brand.onAccent} strokeWidth={2.5} />
              <Text style={styles.addLabel}>เพิ่มสินค้าใหม่</Text>
            </PressableScale>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        />
        <DeleteConfirmModal
          visible={!!deleteTarget}
          productName={deleteTarget?.name ?? ''}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={onDeleteConfirm}
        />
      </AdminGuard>
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Brand.accent,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 14,
    marginBottom: 16,
  },
  addLabel: {
    fontSize: 13,
    fontFamily: PixelFonts.headingBold,
    color: Brand.onAccent,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    padding: 10,
  },
  deleteIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
  },
  image: {
    width: 56,
    height: 56,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontFamily: PixelFonts.bodySemiBold,
    color: Brand.text,
  },
  meta: {
    fontSize: 12,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
  },
  editLabel: {
    fontSize: 12,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.textSecondary,
  },
});
