import { useFocusEffect } from 'expo-router';
import { Bell, Package, Tag } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { notificationsApi } from '@/api/notifications';
import { PressableScale } from '@/components/shop/pressable-scale';
import { RequireAuth } from '@/components/shop/require-auth';
import { TopBar } from '@/components/shop/top-bar';
import { Brand, Radius } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { AppNotification } from '@/types/shop';

function iconFor(type: string) {
  if (type === 'order') return Package;
  if (type === 'promo') return Tag;
  return Bell;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    notificationsApi
      .list(token)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const Icon = iconFor(item.type);
            return (
              <PressableScale
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
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Bell size={32} color={Brand.textSecondary} strokeWidth={2} />
                <Text style={styles.emptyText}>ยังไม่มีการแจ้งเตือน</Text>
              </View>
            ) : null
          }
        />
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
