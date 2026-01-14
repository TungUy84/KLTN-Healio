import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingProvider } from '../../context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="step1-info" options={{ title: 'Thông tin cơ bản' }} />
        <Stack.Screen name="step2-body" options={{ title: 'Chỉ số cơ thể' }} />
        <Stack.Screen name="step3-goal" options={{ title: 'Mục tiêu' }} />
        <Stack.Screen name="step4-diet" options={{ title: 'Chế độ ăn' }} />
        <Stack.Screen name="result" options={{ title: 'Kết quả' }} />
      </Stack>
    </OnboardingProvider>
  );
}
