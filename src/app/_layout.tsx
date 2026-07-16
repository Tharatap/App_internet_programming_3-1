import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFrameWidth, Brand } from '@/constants/theme';
import { CatalogProvider } from '@/store/catalog-store';
import { ShopProvider } from '@/store/shop-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <CatalogProvider>
        <ShopProvider>
        <StatusBar style="dark" />
        {/* On web, constrain the app to a centered phone-width column. */}
        <View style={styles.frame}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Brand.background },
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="products" />
          </Stack>
          <AnimatedSplashOverlay />
        </View>
        </ShopProvider>
      </CatalogProvider>
    </GestureHandlerRootView>
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
