import 'react-native-reanimated';

import { Kanit_400Regular, Kanit_500Medium, Kanit_600SemiBold, Kanit_700Bold } from '@expo-google-fonts/kanit';
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
} from '@expo-google-fonts/noto-sans-thai';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineBanner } from '@/components/shop/offline-banner';
import { AppFrameWidth, Brand } from '@/constants/theme';
import { AuthProvider } from '@/store/auth-store';
import { CatalogProvider } from '@/store/catalog-store';
import { ShopProvider } from '@/store/shop-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PressStart2P_400Regular,
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_600SemiBold,
    Kanit_700Bold,
    NotoSansThai_400Regular,
    NotoSansThai_500Medium,
    NotoSansThai_600SemiBold,
  });

  // Keep the native splash screen up (already prevented from auto-hiding above)
  // until the pixel-theme fonts are ready — AnimatedSplashOverlay is what
  // actually calls SplashScreen.hideAsync() once it lays out.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <AuthProvider>
          <CatalogProvider>
            <ShopProvider>
              <StatusBar style="dark" />
              {/* On web, constrain the app to a centered phone-width column. */}
              <View style={styles.frame}>
                <OfflineBanner />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Brand.background },
                  }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="product/[id]" />
                  <Stack.Screen name="products" />
                  <Stack.Screen name="search" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="notifications" />
                  <Stack.Screen name="coupons" />
                  <Stack.Screen name="addresses/index" />
                  <Stack.Screen name="addresses/edit" />
                  <Stack.Screen name="orders/index" />
                  <Stack.Screen name="orders/[id]" />
                  <Stack.Screen name="checkout" />
                  <Stack.Screen name="admin/products" />
                  <Stack.Screen name="admin/product-form" />
                </Stack>
                <AnimatedSplashOverlay />
              </View>
            </ShopProvider>
          </CatalogProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Grey backdrop behind the centered app frame on wide web screens.
    backgroundColor: Platform.OS === 'web' ? '#E9E9EC' : Brand.background,
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? AppFrameWidth : undefined,
    backgroundColor: Brand.background,
  },
});
