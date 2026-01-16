import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// 👇 1. IMPORT CÁI NÀY (Đảm bảo đường dẫn đúng tới file Context của bạn)
import { OnboardingProvider } from '../context/OnboardingContext'; 
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}