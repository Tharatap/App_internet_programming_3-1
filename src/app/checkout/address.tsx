import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addressesApi } from '@/api/addresses';
import { AddressCard } from '@/components/shop/address-card';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { PixelBorder, PixelFonts, PixelShadow, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { Address } from '@/types/shop';

export default function CheckoutAddressScreen() {
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      addressesApi.list(token).then((list) => {
        setAddresses(list);
        setSelectedId((prev) => {
          if (prev && list.some((a) => a.id === prev)) return prev;
          return list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;
        });
      });
    }, [token])
  );

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="เลือกที่อยู่จัดส่ง" showBack />
      <RequireAuth title="ที่อยู่จัดส่ง">
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              selected={item.id === selectedId}
              onPress={() => setSelectedId(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>ยังไม่มีที่อยู่จัดส่ง — เพิ่มที่อยู่ก่อนเพื่อดำเนินการต่อ</Text>
          }
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <PressableScale
            accessibilityRole="button"
            style={styles.secondaryButton}
            onPress={() => router.push('/addresses/edit')}>
            <Text style={styles.secondaryText}>+ เพิ่มที่อยู่ใหม่</Text>
          </PressableScale>
          <PressableScale
            accessibilityRole="button"
            style={[styles.primaryButton, !selectedId && styles.primaryButtonDisabled]}
            pixelShadow={selectedId ? PixelShadow.sm : undefined}
            disabled={!selectedId}
            onPress={() => router.push(`/checkout/summary?addressId=${selectedId}`)}>
            <Text style={styles.primaryText}>ดำเนินการต่อ</Text>
          </PressableScale>
        </View>
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
    textAlign: 'center',
    marginTop: 60,
    fontFamily: PixelFonts.bodyRegular,
    color: Brand.textSecondary,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: Brand.background,
    borderTopWidth: PixelBorder.thick,
    borderTopColor: Brand.divider,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryText: {
    fontSize: 13,
    fontFamily: PixelFonts.headingSemiBold,
    color: Brand.successBg,
  },
  primaryButton: {
    backgroundColor: Brand.accent,
    borderWidth: PixelBorder.base,
    borderColor: Brand.divider,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: Brand.surfaceDeep,
  },
  primaryText: {
    fontSize: 13,
    fontFamily: PixelFonts.pixel,
    color: Brand.onAccent,
  },
});
