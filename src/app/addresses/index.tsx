import { useFocusEffect, useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { AddressCard } from '@/components/shop/address-card';
import { ConfirmModal } from '@/components/shop/confirm-modal';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { useToast } from '@/components/shop/toast';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useBrand } from '@/store/theme-store';
import { Address } from '@/types/shop';

export default function AddressesScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const list = await addressesApi.list(token);
      setAddresses(list);
    } catch {
      // keep whatever was already shown
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Refetch every time this screen regains focus (e.g. after adding/editing).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = (address: Address) => {
    if (!token) return;
    setPendingDelete(address);
  };

  const onDeleteConfirm = async () => {
    if (!token || !pendingDelete) return;
    try {
      await addressesApi.remove(token, pendingDelete.id);
      await load();
    } catch {
      showToast('ลบที่อยู่ไม่สำเร็จ');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="ที่อยู่จัดส่ง" showBack />
      <RequireAuth title="ที่อยู่จัดส่ง">
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              onEdit={() => router.push(`/addresses/edit?id=${item.id}`)}
              onDelete={() => onDelete(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <MapPin size={32} color={Brand.textSecondary} strokeWidth={2} />
                <Text style={styles.emptyText}>ยังไม่มีที่อยู่จัดส่ง</Text>
              </View>
            ) : null
          }
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <PressableScale
            accessibilityRole="button"
            style={styles.addButton}
            onPress={() => router.push('/addresses/edit')}>
            <Text style={styles.addButtonText}>+ เพิ่มที่อยู่ใหม่</Text>
          </PressableScale>
        </View>
        <ConfirmModal
          visible={!!pendingDelete}
          title="ลบที่อยู่นี้?"
          message={pendingDelete?.line1}
          confirmText="ลบ"
          destructive
          onCancel={() => setPendingDelete(null)}
          onConfirm={onDeleteConfirm}
        />
      </RequireAuth>
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
  empty: {
    alignItems: 'center',
    gap: 8,
    marginTop: 60,
  },
  emptyText: {
    color: Brand.textSecondary,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Brand.background,
    borderTopWidth: 1,
    borderTopColor: Brand.divider,
  },
  addButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
