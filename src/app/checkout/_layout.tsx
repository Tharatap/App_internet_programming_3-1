import { Stack } from 'expo-router';

import { Brand } from '@/constants/theme';

export default function CheckoutLayout() {
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
