import { Tabs } from 'expo-router';
import { Heart, House, LayoutGrid, ShoppingCart, User } from 'lucide-react-native';
import { Platform } from 'react-native';

import { Brand } from '@/constants/theme';
import { useShop } from '@/store/shop-store';

export default function TabsLayout() {
  const { cartCount } = useShop();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.text,
        tabBarInactiveTintColor: Brand.tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: Brand.background,
          borderTopColor: Brand.divider,
          borderTopWidth: 1,
          height: Platform.select({ ios: 84, default: 64 }),
          paddingTop: 6,
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าแรก',
          tabBarIcon: ({ color }) => <House size={23} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'หมวดหมู่',
          tabBarIcon: ({ color }) => <LayoutGrid size={23} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'ตะกร้า',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Brand.favoriteIcon, fontSize: 10 },
          tabBarIcon: ({ color }) => <ShoppingCart size={23} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'โปรด',
          tabBarIcon: ({ color }) => <Heart size={23} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color }) => <User size={23} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
