import { Redirect, Tabs } from 'expo-router';
import { Heart, House, LayoutGrid, ShoppingCart, User } from 'lucide-react-native';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { Brand, PixelBorder, PixelFonts } from '@/constants/theme';
import { useAuth } from '@/store/auth-store';
import { useShop } from '@/store/shop-store';

export default function TabsLayout() {
  const { cartCount } = useShop();
  const { loading, isAuthenticated, isGuest } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.text} />
      </View>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.text,
        tabBarInactiveTintColor: Brand.tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontFamily: PixelFonts.headingSemiBold },
        tabBarStyle: {
          backgroundColor: Brand.surface,
          borderTopColor: Brand.divider,
          borderTopWidth: PixelBorder.thick,
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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.background,
  },
});
