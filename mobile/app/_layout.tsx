import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from '../context/OnboardingContext'; 
import '../global.css';

// TẮT CẢNH BÁO VÀNG
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// Cấu hình tắt strict mode
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Tắt cảnh báo strict
});

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