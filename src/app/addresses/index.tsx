import { useFocusEffect, useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { AddressCard } from '@/components/shop/address-card';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { Address } from '@/types/shop';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

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
    Alert.alert('ลบที่อยู่นี้?', address.line1, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          await addressesApi.remove(token, address.id);
          load();
        },
      },
    ]);
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
            style={styles.addButton}
            onPress={() => router.push('/addresses/edit')}>
            <Text style={styles.addButtonText}>+ เพิ่มที่อยู่ใหม่</Text>
          </PressableScale>
        </View>
      </RequireAuth>
    </View>
  );
}

const styles = StyleSheet.create({
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
