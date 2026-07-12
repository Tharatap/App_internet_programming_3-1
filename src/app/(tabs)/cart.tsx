import { ChevronRight, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Checkbox } from '@/components/shop/checkbox';
import { PressableScale } from '@/components/shop/pressable-scale';
import { QuantityStepper } from '@/components/shop/quantity-stepper';
import { SkeletonImage } from '@/components/shop/skeleton-image';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useShop } from '@/store/shop-store';
import { formatBaht } from '@/utils/format';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const {
    cart,
    selectedTotal,
    setQuantity,
    toggleCartSelected,
    setAllSelected,
  } = useShop();

  const allSelected = cart.length > 0 && cart.every((item) => item.selected);

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="ตะกร้าสินค้า" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* Delivery address */}
        <Pressable style={styles.address}>
          <MapPin size={18} color={Brand.text} strokeWidth={2} />
          <View style={styles.addressBody}>
            <Text style={styles.addressLabel}>จัดส่งไปที่</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              92 ถ.สุขุมวิท กรุงเทพฯ
            </Text>
          </View>
          <ChevronRight size={18} color={Brand.textMuted} strokeWidth={2} />
        </Pressable>

        {cart.length === 0 ? (
          <Text style={styles.empty}>ยังไม่มีสินค้าในตะกร้า</Text>
        ) : (
          <>
            {/* Select all */}
            <Pressable
              style={styles.selectAll}
              onPress={() => setAllSelected(!allSelected)}>
              <Checkbox
                checked={allSelected}
                onToggle={() => setAllSelected(!allSelected)}
                accessibilityLabel="เลือกทั้งหมด"
              />
              <Text style={styles.selectAllText}>เลือกทั้งหมด</Text>
            </Pressable>

            {/* Items */}
            <View style={styles.items}>
              {cart.map((item) => (
                <View key={item.product.id} style={styles.item}>
                  <Checkbox
                    checked={item.selected}
                    onToggle={() => toggleCartSelected(item.product.id)}
                  />
                  <SkeletonImage style={styles.itemImage} borderRadius={Radius.md} />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{formatBaht(item.product.price)}</Text>
                      <QuantityStepper
                        quantity={item.quantity}
                        onChange={(q) => setQuantity(item.product.id, q)}
                        min={0}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky checkout */}
      {cart.length > 0 ? (
        <View style={[styles.sticky, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ยอดรวม</Text>
            <Text style={styles.totalValue}>{formatBaht(selectedTotal)}</Text>
          </View>
          <PressableScale style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>ชำระเงิน</Text>
          </PressableScale>
        </View>
      ) : null}
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
    paddingBottom: 160,
    gap: 16,
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 16,
  },
  addressBody: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: Brand.text,
  },
  items: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
  },
  itemBody: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: Brand.text,
    lineHeight: 19,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: Brand.textSecondary,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Brand.background,
    borderTopColor: Brand.divider,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Brand.text,
  },
  checkoutButton: {
    backgroundColor: Brand.accent,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.onAccent,
  },
});
