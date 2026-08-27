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
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineBanner } from '@/components/shop/offline-banner';
import { ToastProvider } from '@/components/shop/toast';
import { AppFrameWidth, type BrandPalette } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { AuthProvider, useAuth } from '@/store/auth-store';
import { CatalogProvider } from '@/store/catalog-store';
import { ShopProvider } from '@/store/shop-store';
import { ThemeProvider, useBrand, useThemeMode } from '@/store/theme-store';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemedRootLayout />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedRootLayout() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  const { resolved } = useThemeMode();

  return (
    <ErrorBoundary>
      <View style={styles.root}>
        <AuthProvider>
          <ThemeSync />
          <CatalogProvider>
            <ToastProvider>
              <ShopProvider>
                <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
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
            </ToastProvider>
          </CatalogProvider>
        </AuthProvider>
      </View>
    </ErrorBoundary>
  );
}

function ThemeSync() {
  const { user } = useAuth();
  const { setMode } = useThemeMode();

  useEffect(() => {
    if (user?.settings.theme) {
      setMode(user.settings.theme);
    }
  }, [setMode, user?.settings.theme]);

  return null;
}

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  root: {
    flex: 1,
    // Grey backdrop behind the centered app frame on wide web screens.
    backgroundColor: Platform.OS === 'web' ? Brand.webBackdrop : Brand.background,
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? AppFrameWidth : undefined,
    backgroundColor: Brand.background,
  },
});
