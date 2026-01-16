import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

export default function Step4Goal() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [goalWeight, setGoalWeight] = useState(data.goalWeight || '');

  const currentW = parseFloat(data.weight || '0');
  const targetW = parseFloat(goalWeight || '0');

  // AC3: Hệ thống tự động so sánh
  useEffect(() => {
    if (targetW > 0 && currentW > 0) {
        let type: 'lose_weight' | 'maintain' | 'gain_weight' = 'maintain';
        if (targetW < currentW) type = 'lose_weight';
        else if (targetW > currentW) type = 'gain_weight';
        
        if (data.goalType !== type) {
             updateData({ goalType: type });
        }
    }
  }, [goalWeight]);

  const handleNext = () => {
    if (!goalWeight) return;
    updateData({ goalWeight });
    router.push('/onboarding/step5-diet'); // AC4
  };

  // Helper để hiển thị thông báo trạng thái (AC3)
  const getReason = () => {
      if (currentW === 0 || targetW === 0) return 'Nhập cân nặng để xem mục tiêu';
      if (targetW < currentW) return `Bạn muốn giảm ${(currentW - targetW).toFixed(1).replace(/\.0$/, '')} kg 🔥`;
      if (targetW > currentW) return `Bạn muốn tăng ${(targetW - currentW).toFixed(1).replace(/\.0$/, '')} kg 💪`;
      return 'Bạn muốn duy trì cân nặng 🧘';
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        
            {/*Header - Emerald Style (Đồng bộ Step 1 & 2) */}
            <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
                <SafeAreaView edges={['top']} className="px-6 pb-4">
                    {/* Navbar */}
                    <View className="flex-row justify-between items-center mb-6 mt-2">
                        <Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full active:bg-white/30">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </Pressable>
                        
                        {/* Pagination Dots (Step 4/5) */}
                        <View className="flex-row gap-2">
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-8 h-2 bg-white rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                        </View>

                        <Pressable onPress={() => router.replace('/(tabs)')}>
                            <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                        </Pressable>
                    </View>

                    {/* Header Content */}
                    <View className="items-center mt-2">
                        <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                            <Ionicons name="flag-outline" size={40} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-white text-center mb-2">Mục tiêu của bạn</Text>
                        <Text className="text-white/90 text-center text-base px-4">
                             Hãy cho chúng tôi biết cân nặng mong muốn
                        </Text>
                    </View>
                </SafeAreaView>
                
                {/* Decorative circles */}
                <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
            </View>

            {/* Content Area */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1"
            >
                <View className="flex-1 px-6 pt-10 pb-8 justify-between">
                    <View className="gap-6">
                         
                         {/* AC1: Cân nặng hiện tại (Readonly) */}
                         <View>
                            <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Cân nặng hiện tại</Text>
                            <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-20 bg-gray-100">
                                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="body-outline" size={24} color="#6b7280" />
                                </View>
                                <Text className="flex-1 text-3xl font-bold text-gray-500 h-full pt-4">
                                    {data.weight || 0}
                                </Text>
                                <Text className="text-gray-400 text-lg font-medium">kg</Text>
                                <Ionicons name="lock-closed" size={16} color="#9ca3af" style={{marginLeft: 8}}/>
                            </View>
                         </View>

                        {/* AC1: Ô nhập Cân nặng mục tiêu */}
                        <View>
                            <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Cân nặng mong muốn</Text>
                            <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-20 bg-gray-50 focus:border-emerald-500 transition-colors">
                                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="trophy-outline" size={24} color="#f97316" />
                                </View>
                                <TextInput 
                                    className="flex-1 text-3xl font-bold text-gray-900 h-full pb-1"
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#d1d5db"
                                    value={goalWeight}
                                    maxLength={3} // AC2: Giới hạn độ dài hợp lý
                                    onChangeText={(t) => {
                                        setGoalWeight(t);
                                        updateData({ goalWeight: t });
                                    }}
                                />
                                <Text className="text-gray-500 text-lg font-medium">kg</Text>
                            </View>
                        </View>

                        {/* AC3: Hiển thị phân tích (Tự động so sánh) */}
                        {targetW > 0 && currentW > 0 && (
                            <View className={`mt-2 p-4 rounded-2xl border flex-row items-center gap-3 ${
                                targetW < currentW ? 'bg-orange-50 border-orange-200' : // Giảm cân
                                targetW > currentW ? 'bg-blue-50 border-blue-200' :     // Tăng cân
                                'bg-emerald-50 border-emerald-200'                      // Giữ cân
                            }`}>
                                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                                    targetW < currentW ? 'bg-orange-100' : 
                                    targetW > currentW ? 'bg-blue-100' : 
                                    'bg-emerald-100'
                                }`}>
                                    <Ionicons 
                                        name={targetW < currentW ? "trending-down" : targetW > currentW ? "trending-up" : "remove"} 
                                        size={18} 
                                        color={targetW < currentW ? "#f97316" : targetW > currentW ? "#3b82f6" : "#10b981"} 
                                    />
                                </View>
                                <Text className={`font-semibold flex-1 text-base ${
                                    targetW < currentW ? 'text-orange-700' : 
                                    targetW > currentW ? 'text-blue-700' : 
                                    'text-emerald-700'
                                }`}>
                                    {getReason()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Footer Button - Style nút Cam bo tròn */}
                    <Pressable 
                        className={`w-full p-5 rounded-full flex-row items-center justify-center shadow-lg transition-all active:scale-[0.98] ${
                            !goalWeight ? 'bg-gray-300 opacity-70' : 'bg-orange-500 shadow-orange-500/30'
                        }`}
                        onPress={handleNext}
                        disabled={!goalWeight}
                    >
                        <Text className="text-white text-xl font-bold mr-2">Tiếp tục</Text>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    </TouchableWithoutFeedback>
  );
}