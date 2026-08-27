import { useRouter } from 'expo-router';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/shop/icon-button';
import { ProductCard } from '@/components/shop/product-card';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useCatalog } from '@/store/catalog-store';
import { useBrand } from '@/store/theme-store';
import { Product } from '@/types/product';
import { searchHistory } from '@/utils/search-history';

/**
 * ตรรกะการจับคู่คำค้น — เทียบกับ ชื่อ / คำอธิบาย / แบรนด์ โดยไม่สนตัวพิมพ์เล็กใหญ่
 * ใช้ `includes` (substring) ไม่ใช่การเทียบทั้งคำ เพราะภาษาไทยไม่มีเว้นวรรคระหว่างคำ
 * จะตัดคำแล้วเทียบทีละคำไม่ได้
 */
function matches(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return (
    product.name.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q) ||
    (product.brand ?? '').toLowerCase().includes(q)
  );
}

/**
 * หน้าค้นหาสินค้า
 *
 * ค้นในเครื่องจากสินค้าที่ catalog-store โหลดมาแล้ว (ไม่ยิง API ทุกตัวอักษร)
 * เพราะแคตตาล็อกมีแค่ 12 รายการ → ได้ผลลัพธ์ทันทีและใช้งานต่อได้แม้เน็ตหลุด
 * หมายเหตุ: ฝั่ง server รองรับ `GET /api/products?q=` อยู่แล้ว ถ้าสินค้าเยอะขึ้นค่อยสลับไปใช้
 */
export default function SearchScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products } = useCatalog();

  const [query, setQuery] = useState('');
  // ค่าที่หน่วงเวลาแล้ว — ใช้ตัวนี้กรอง ไม่ใช่ query ดิบ
  const [debounced, setDebounced] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  // โหลดประวัติการค้นหาที่เก็บไว้ในเครื่อง (ล้างได้จากหน้าตั้งค่า → "ล้างแคช")
  useEffect(() => {
    searchHistory.list().then(setRecent);
  }, []);

  // หน่วงเวลา 300ms — ไม่ให้กรองใหม่ทุกครั้งที่กดแป้นพิมพ์
  // cleanup ด้วย clearTimeout ทำให้ตัวจับเวลาเดิมถูกยกเลิกเมื่อพิมพ์ตัวถัดไป
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // useMemo กันไม่ให้กรองใหม่ตอน re-render ที่ไม่เกี่ยวข้อง (เช่นเปลี่ยนธีม)
  const results = useMemo(
    () => (debounced.trim() ? products.filter((p) => matches(p, debounced)) : []),
    [products, debounced]
  );

  /** ค้นหาจริง + บันทึกคำค้นลงประวัติ (เรียกตอนกด Enter หรือกดชิปประวัติ) */
  const runSearch = async (term: string) => {
    setQuery(term);
    const next = await searchHistory.add(term);
    setRecent(next);
  };

  const onSubmit = () => {
    if (query.trim()) runSearch(query);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <IconButton onPress={() => router.back()} accessibilityLabel="ย้อนกลับ">
          <ChevronLeft size={22} color={Brand.text} strokeWidth={2} />
        </IconButton>
        <View style={styles.inputWrapper}>
          <Search size={18} color={Brand.textMuted} strokeWidth={2} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmit}
            placeholder="ค้นหาสินค้าเครื่องใช้ไฟฟ้า"
            placeholderTextColor={Brand.textMuted}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={Brand.textMuted} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {debounced.trim() === '' ? (
        <View style={styles.recentSection}>
          {recent.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>ค้นหาล่าสุด</Text>
              <View style={styles.chipRow}>
                {recent.map((term) => (
                  <Pressable key={term} style={styles.chip} onPress={() => runSearch(term)}>
                    <Text style={styles.chipText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.hint}>พิมพ์ชื่อสินค้าที่ต้องการค้นหา</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ProductCard product={item} variant="row" index={index} />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.hint}>ไม่พบสินค้าที่ตรงกับ &quot;{debounced}&quot;</Text>
          }
        />
      )}
    </View>
  );
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Brand.text,
  },
  recentSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  hint: {
    textAlign: 'center',
    marginTop: 40,
    color: Brand.textSecondary,
  },
  list: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  separator: {
    height: 12,
  },
});
