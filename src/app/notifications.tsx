import { useFocusEffect } from 'expo-router';
import { Bell, Package, Tag } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { notificationsApi } from '@/api/notifications';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { Radius, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/store/auth-store';
import { useBrand } from '@/store/theme-store';
import { AppNotification } from '@/types/shop';

function iconFor(type: string) {
  if (type === 'order') return Package;
  if (type === 'promo') return Tag;
  return Bell;
}

export default function NotificationsScreen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const notifyPromo = user?.settings.notifyPromo ?? true;
  const visibleItems = notifyPromo ? items : items.filter((item) => item.type !== 'promo');
  const promoFilteredToEmpty = !notifyPromo && items.length > 0 && visibleItems.length === 0;

  const load = useCallback(async () => {
    if (!token) return;
    const nextItems = await notificationsApi.list(token);
    setItems(nextItems);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load().catch(() => {}).finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch {
      // Keep the last successful list when the refresh request fails.
    } finally {
      setRefreshing(false);
    }
  };

  const onPressItem = async (item: AppNotification) => {
    if (!token || item.isRead) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    notificationsApi.markRead(token, item.id).catch(() => {});
  };

  return (
    <View style={styles.screen}>
      <TopBar variant="list" title="การแจ้งเตือน" showBack />
      <RequireAuth title="การแจ้งเตือน">
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const Icon = iconFor(item.type);
            return (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`อ่านการแจ้งเตือน ${item.title}`}
                style={[styles.card, !item.isRead && styles.cardUnread]}
                onPress={() => onPressItem(item)}>
                <View style={styles.iconWrapper}>
                  <Icon size={18} color={Brand.text} strokeWidth={2} />
                  {!item.isRead ? <View style={styles.dot} /> : null}
                </View>
                <View style={styles.body}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(item.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </Text>
                </View>
              </PressableScale>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Brand.text}
              colors={[Brand.text]}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Bell size={32} color={Brand.textSecondary} strokeWidth={2} />
                <Text style={styles.emptyText}>
                  {promoFilteredToEmpty
                    ? 'ปิดการแจ้งเตือนโปรโมชันอยู่ — เปิดได้ในหน้าตั้งค่า'
                    : 'ยังไม่มีการแจ้งเตือน'}
                </Text>
              </View>
            ) : null
          }
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
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Brand.surface,
    borderRadius: Radius.card,
    padding: 14,
  },
  cardUnread: {
    backgroundColor: Brand.successBg,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.notification,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.text,
  },
  message: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  time: {
    fontSize: 11,
    color: Brand.textMuted,
    marginTop: 2,
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
});
