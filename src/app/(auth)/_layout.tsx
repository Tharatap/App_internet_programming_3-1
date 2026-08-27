import { Stack } from 'expo-router';

import { useBrand } from '@/store/theme-store';

export default function AuthLayout() {
  const Brand = useBrand();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Brand.background },
      }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
