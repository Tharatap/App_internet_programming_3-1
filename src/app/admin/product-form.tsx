import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { catalogApi } from '@/api/catalog';
import { uploadsApi } from '@/api/uploads';
import { AdminGuard } from '@/components/shop/admin-guard';
import { Checkbox } from '@/components/shop/checkbox';
import { DeleteConfirmModal } from '@/components/shop/delete-confirm-modal';
import { PressableScale } from '@/components/shop/pressable-scale';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { PixelBorder, Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useCatalog } from '@/store/catalog-store';
import { useBrand } from '@/store/theme-store';
import { BranchStock, ProductInput } from '@/types/product';

const emptyForm: ProductInput = {
  name: '',
  categoryId: '',
  brand: '',
  price: 0,
  originalPrice: undefined,
  images: [],
  description: '',
  energySavingPercent: undefined,
  inStock: true,
  isFlashSale: false,
  installmentPerMonth: undefined,
  specs: { power: '', suitableRoom: '', warranty: '' },
  branchStock: [],
};

/**
 * ฟอร์มสินค้าของแอดมิน — **ใช้ไฟล์เดียวทั้งเพิ่มและแก้ไข**
 *   /admin/product-form          → โหมดเพิ่มสินค้าใหม่
 *   /admin/product-form?id=p123  → โหมดแก้ไข (isEditing = true)
 *
 * หน้านี้ถูกกันด้วย AdminGuard และทุก endpoint ที่เรียกถูกกันด้วย adminOnly ฝั่ง server อีกชั้น
 * ทางเดินของข้อมูล: onSubmit() → catalogApi → POST/PUT /api/products → refresh()
 */
export default function AdminProductFormScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { showToast } = useToast();
  const { categories, getProductById, refresh } = useCatalog();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // มี ?id= ใน URL หรือไม่ = ตัวแยกว่าโหมดเพิ่มหรือแก้ไข
  const isEditing = !!id;

  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [imagesText, setImagesText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // โหมดแก้ไข: ดึงสินค้าเดิมจาก catalog-store (โหลดไว้แล้ว ไม่ต้องยิง API ซ้ำ) มาเติมลงฟอร์ม
  useEffect(() => {
    if (!isEditing) return;
    const product = getProductById(id!);
    if (!product) return;
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      brand: product.brand ?? '',
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images,
      description: product.description,
      energySavingPercent: product.energySavingPercent,
      inStock: product.inStock,
      isFlashSale: !!product.isFlashSale,
      installmentPerMonth: product.installmentPerMonth,
      specs: product.specs,
      branchStock: product.branchStock,
    });
    setImagesText(product.images.join('\n'));
  }, [isEditing, id, getProductById]);

  const setField = <K extends keyof ProductInput>(field: K, value: ProductInput[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addBranch = () =>
    setField('branchStock', [...form.branchStock, { id: '', name: '', inStock: true }]);

  const updateBranch = (index: number, patch: Partial<BranchStock>) =>
    setField(
      'branchStock',
      form.branchStock.map((b, i) => (i === index ? { ...b, ...patch } : b))
    );

  const removeBranch = (index: number) =>
    setField(
      'branchStock',
      form.branchStock.filter((_, i) => i !== index)
    );

  const onPickImage = async () => {
    if (!token) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('ไม่ได้รับสิทธิ์เข้าถึงรูปภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        showToast('อ่านไฟล์ไม่สำเร็จ');
        return;
      }

      setUploading(true);
      const { url } = await uploadsApi.uploadImage(token, {
        fileName: asset.fileName ?? 'image.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg',
        data: asset.base64,
      });
      setImagesText((prev) => (prev.trim() ? `${prev.trim()}\n${url}` : url));
      showToast('อัปโหลดรูปสำเร็จ');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  /** บันทึกฟอร์ม — ปุ่มเดียวใช้ทั้ง "เพิ่ม" และ "แก้ไข" แยกด้วย isEditing */
  const onSubmit = async () => {
    if (!token) return;
    // ตรวจฝั่งแอปก่อน (server ตรวจซ้ำที่ validateProductInput() อีกชั้นเสมอ)
    if (!form.name || !form.categoryId || !form.description) {
      setError('กรุณากรอกชื่อ หมวดหมู่ และคำอธิบายสินค้าให้ครบ');
      return;
    }
    if (!(form.price > 0)) {
      setError('กรุณากรอกราคาสินค้าให้ถูกต้อง');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload: ProductInput = {
        ...form,
        // ช่องรูปภาพให้พิมพ์ URL บรรทัดละ 1 ลิงก์ → แปลงเป็น array และตัดบรรทัดว่างทิ้ง
        images: imagesText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      };
      if (isEditing) {
        await catalogApi.updateProduct(token, id!, payload);
      } else {
        await catalogApi.createProduct(token, payload);
      }
      // สั่ง catalog-store โหลดสินค้าใหม่ทั้งชุด เพื่อให้ทุกหน้าในแอป
      // (หน้าแรก, หมวดหมู่, รายละเอียดสินค้า) เห็นข้อมูลที่เพิ่งแก้ทันที
      refresh();
      router.back();
    } catch (err) {
      // เช่นไม่ใช่แอดมิน → server คืน 403 'เฉพาะแอดมินเท่านั้น'
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  /** ลบสินค้า — เรียกจาก DeleteConfirmModal ที่บังคับให้พิมพ์ "Confirm Delete" ก่อน */
  const onDeleteConfirm = async () => {
    if (!token || !id) return;
    setDeleting(true);
    try {
      await catalogApi.deleteProduct(token, id);
      refresh();
      // ใช้ replace ไม่ใช่ back() เพราะสินค้าที่ฟอร์มนี้อ้างอิงถูกลบไปแล้ว
      // ถ้า back() กลับมาหน้านี้อีกจะกลายเป็นฟอร์มที่ชี้ไปสินค้าที่ไม่มีอยู่
      router.replace('/admin/products');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'ลบสินค้าไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title={isEditing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'} showBack />
      <AdminGuard>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled">
          <Field label="ชื่อสินค้า" value={form.name} onChangeText={(t) => setField('name', t)} />

          <View style={styles.field}>
            <Text style={styles.label}>หมวดหมู่</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={`เลือกหมวดหมู่ ${cat.name}`}
                  key={cat.id}
                  style={[styles.chip, form.categoryId === cat.id && styles.chipActive]}
                  onPress={() => setField('categoryId', cat.id)}>
                  <Text
                    style={[
                      styles.chipLabel,
                      form.categoryId === cat.id && styles.chipLabelActive,
                    ]}>
                    {cat.name}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </View>

          <Field label="ยี่ห้อ" value={form.brand} onChangeText={(t) => setField('brand', t)} />
          <Field
            label="ราคา (บาท)"
            value={String(form.price || '')}
            onChangeText={(t) => setField('price', Number(t) || 0)}
            keyboardType="decimal-pad"
          />
          <Field
            label="ราคาเดิม (ถ้ามีส่วนลด)"
            value={form.originalPrice ? String(form.originalPrice) : ''}
            onChangeText={(t) => setField('originalPrice', t ? Number(t) : undefined)}
            keyboardType="decimal-pad"
          />
          <Field
            label="รูปภาพ (1 บรรทัด = 1 URL — หรือกดปุ่มด้านล่างเพื่อเลือกไฟล์)"
            value={imagesText}
            onChangeText={setImagesText}
            multiline
          />
          <PressableScale
            accessibilityRole="button"
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={onPickImage}
            disabled={uploading}>
            <Text style={styles.uploadButtonText}>
              {uploading ? 'กำลังอัปโหลด...' : 'เลือกรูปจากเครื่อง'}
            </Text>
          </PressableScale>
          <Field
            label="คำอธิบาย"
            value={form.description}
            onChangeText={(t) => setField('description', t)}
            multiline
          />
          <Field
            label="% ประหยัดไฟ (ถ้ามี)"
            value={form.energySavingPercent ? String(form.energySavingPercent) : ''}
            onChangeText={(t) => setField('energySavingPercent', t ? Number(t) : undefined)}
            keyboardType="number-pad"
          />
          <Field
            label="ผ่อนต่อเดือน (ถ้ามี)"
            value={form.installmentPerMonth ? String(form.installmentPerMonth) : ''}
            onChangeText={(t) => setField('installmentPerMonth', t ? Number(t) : undefined)}
            keyboardType="decimal-pad"
          />

          <View style={styles.toggleRow}>
            <Checkbox
              checked={form.inStock}
              onToggle={() => setField('inStock', !form.inStock)}
              accessibilityLabel="มีสินค้า"
            />
            <Text style={styles.toggleLabel}>มีสินค้า</Text>
          </View>
          <View style={styles.toggleRow}>
            <Checkbox
              checked={form.isFlashSale}
              onToggle={() => setField('isFlashSale', !form.isFlashSale)}
              accessibilityLabel="แฟลชเซล"
            />
            <Text style={styles.toggleLabel}>แฟลชเซล</Text>
          </View>

          <Text style={styles.sectionTitle}>สเปคสินค้า</Text>
          <Field
            label="กำลังไฟ"
            value={form.specs.power}
            onChangeText={(t) => setField('specs', { ...form.specs, power: t })}
          />
          <Field
            label="ขนาดห้องที่เหมาะสม"
            value={form.specs.suitableRoom}
            onChangeText={(t) => setField('specs', { ...form.specs, suitableRoom: t })}
          />
          <Field
            label="การรับประกัน"
            value={form.specs.warranty}
            onChangeText={(t) => setField('specs', { ...form.specs, warranty: t })}
          />

          <View style={styles.branchHeader}>
            <Text style={styles.sectionTitle}>สต๊อกสาขา</Text>
            <PressableScale
              accessibilityRole="button"
              style={styles.addBranchButton}
              onPress={addBranch}>
              <Text style={styles.addBranchText}>+ เพิ่มสาขา</Text>
            </PressableScale>
          </View>
          {form.branchStock.map((branch, index) => (
            <View key={index} style={styles.branchRow}>
              <View style={styles.branchInputs}>
                <TextInput
                  style={styles.branchInput}
                  value={branch.id}
                  onChangeText={(t) => updateBranch(index, { id: t })}
                  placeholder="รหัสสาขา"
                  placeholderTextColor={Brand.textMuted}
                />
                <TextInput
                  style={styles.branchInput}
                  value={branch.name}
                  onChangeText={(t) => updateBranch(index, { name: t })}
                  placeholder="ชื่อสาขา"
                  placeholderTextColor={Brand.textMuted}
                />
              </View>
              <Checkbox
                checked={branch.inStock}
                onToggle={() => updateBranch(index, { inStock: !branch.inStock })}
                accessibilityLabel={`มีสต๊อกที่ ${branch.name || 'สาขานี้'}`}
              />
              <PressableScale onPress={() => removeBranch(index)} accessibilityLabel="ลบสาขา">
                <Trash2 size={18} color={Brand.danger} strokeWidth={2} />
              </PressableScale>
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PressableScale
            accessibilityRole="button"
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}</Text>
          </PressableScale>

          {isEditing ? (
            <PressableScale
              accessibilityRole="button"
              style={styles.deleteButton}
              onPress={() => setDeleteModalVisible(true)}>
              <Text style={styles.deleteButtonText}>ลบสินค้า</Text>
            </PressableScale>
          ) : null}
        </ScrollView>
        <DeleteConfirmModal
          visible={deleteModalVisible}
          productName={form.name}
          deleting={deleting}
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={onDeleteConfirm}
        />
      </AdminGuard>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
}) {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMultiline]}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholderTextColor={Brand.textMuted}
        keyboardType={props.keyboardType}
        multiline={props.multiline}
      />
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  input: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Brand.text,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
    backgroundColor: Brand.surface,
  },
  chipActive: {
    backgroundColor: Brand.accent,
  },
  chipLabel: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  chipLabelActive: {
    color: Brand.onAccent,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
    marginTop: 4,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBranchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Brand.surface,
    borderWidth: PixelBorder.thin,
    borderColor: Brand.divider,
  },
  addBranchText: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.text,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  branchInputs: {
    flex: 1,
    gap: 6,
  },
  branchInput: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Brand.text,
  },
  error: {
    fontSize: 13,
    color: Brand.danger,
  },
  submitButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
  deleteButton: {
    backgroundColor: Brand.danger,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
