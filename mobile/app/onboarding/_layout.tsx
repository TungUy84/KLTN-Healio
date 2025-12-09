import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true, 
      headerShadowVisible: false, 
      headerTitle: '', 
      headerTintColor: Colors.text,
      contentStyle: { backgroundColor: '#fff' }
    }}>
      <Stack.Screen name="step1-goal" />
      <Stack.Screen name="step2-info" />
      <Stack.Screen name="step3-body" />
      <Stack.Screen name="step4-active" />
      <Stack.Screen name="calculating" options={{ headerShown: false }} />
    </Stack>
  );
}