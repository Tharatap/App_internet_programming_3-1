import { Stack } from 'expo-router';

import { useBrand } from '@/store/theme-store';

export default function CheckoutLayout() {
  const Brand = useBrand();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Brand.background },
      }}>
      <Stack.Screen name="address" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
