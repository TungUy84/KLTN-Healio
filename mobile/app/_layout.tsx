import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    // contentStyle ép nền trắng toàn app
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/sign-up" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}