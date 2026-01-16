import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { calculateMetrics } from '../../utils/calculations';
import { userService } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

export default function ResultScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (data.weight && data.height) {
        const height = parseFloat(data.height);
        const weight = parseFloat(data.weight);
        // Note: Check date carefully
        const dobDate = data.dob instanceof Date ? data.dob : new Date(data.dob);
        const age = new Date().getFullYear() - dobDate.getFullYear();
        
        const result = calculateMetrics(
            age, 
            data.gender, 
            weight, 
            height,
            data.activityLevel,
            data.goalType,
            data.dietPreset
        );
        setMetrics(result);
    }
  }, [data]);

  const handleFinish = async () => {
    setLoading(true);
    try {
        const payload = {
            ...data,
            nutrition_target: metrics
        };
        await userService.completeOnboarding(payload);
        router.replace('/(tabs)');
    } catch (error) {
        console.log("Error saving profile", error);
        Alert.alert("Lỗi", "Không thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
  };

  if (!metrics) return null;

  return (
    <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        
       {/* Header - Emerald Background */}
       <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                     <View className="p-2"/> 
                     <Text className="text-white font-bold text-lg">Kế hoạch của bạn</Text>
                     <View className="p-2"/> 
                </View>

                {/* Header Content */}
                <View className="items-center mt-2">
                     <View className="bg-white/20 px-6 py-2 rounded-full border border-white/30 backdrop-blur-md mb-4">
                        <Text className="text-white font-bold text-lg">✨ Hoàn tất cá nhân hóa</Text>
                    </View>
                    <Text className="text-4xl font-bold text-white text-center mb-2">{metrics.daily_calories}</Text>
                    <Text className="text-white/90 text-center text-base">
                        Calories mỗi ngày
                    </Text>
                </View>
            </SafeAreaView>
            
             {/* Decorative circles */}
             <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
        </View>

        <ScrollView className="flex-1 px-6 -mt-8 pt-10" showsVerticalScrollIndicator={false}>
            {/* BMI Card */}
            <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100 items-center relative z-20">
                <Text className="text-gray-500 font-medium mb-2">Chỉ số BMI của bạn</Text>
                {(() => {
                    let bmiColor = 'text-red-500';
                    let bmiBg = 'bg-red-100';
                    let bmiTx = 'text-red-700';
                    let bmiLabel = 'Béo phì';

                    if (metrics.bmi < 18.5) {
                        bmiColor = 'text-blue-500';
                        bmiBg = 'bg-blue-100';
                        bmiTx = 'text-blue-700';
                        bmiLabel = 'Thiếu cân';
                    } else if (metrics.bmi < 24.9) {
                        bmiColor = 'text-emerald-500';
                        bmiBg = 'bg-emerald-100';
                        bmiTx = 'text-emerald-700';
                        bmiLabel = 'Bình thường';
                    } else if (metrics.bmi < 29.9) {
                        bmiColor = 'text-orange-500';
                        bmiBg = 'bg-orange-100';
                        bmiTx = 'text-orange-700';
                        bmiLabel = 'Thừa cân';
                    }

                    return (
                        <>
                            <Text className={`text-4xl font-bold mb-2 ${bmiColor}`}>
                                {metrics.bmi}
                            </Text>
                            <View className={`px-3 py-1 rounded-full ${bmiBg}`}>
                                <Text className={`font-bold text-sm ${bmiTx}`}>
                                    {bmiLabel}
                                </Text>
                            </View>
                        </>
                    );
                })()}
            </View>

            {/* Macros Distribution */}
            <View className="bg-gray-50 rounded-3xl p-6 mb-6">
                <Text className="text-gray-800 font-bold text-lg mb-4">Phân bổ dinh dưỡng</Text>
                
                <View className="flex-row gap-3 h-3 mb-4 rounded-full overflow-hidden">
                    <View className="bg-red-500 h-full" style={{ flex: metrics.daily_protein }} />
                    <View className="bg-yellow-500 h-full" style={{ flex: metrics.daily_carb }} />
                    <View className="bg-blue-500 h-full" style={{ flex: metrics.daily_fat }} />
                </View>

                <View className="gap-4">
                    <View className="flex-row justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                        <View className="flex-row items-center gap-2">
                             <View className="w-3 h-3 bg-red-500 rounded-full" />
                             <Text className="font-semibold text-gray-700">Protein</Text>
                        </View>
                        <Text className="font-bold text-gray-900">{metrics.daily_protein}g</Text>
                    </View>
                     <View className="flex-row justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                        <View className="flex-row items-center gap-2">
                             <View className="w-3 h-3 bg-yellow-500 rounded-full" />
                             <Text className="font-semibold text-gray-700">Carbs</Text>
                        </View>
                        <Text className="font-bold text-gray-900">{metrics.daily_carb}g</Text>
                    </View>
                     <View className="flex-row justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                        <View className="flex-row items-center gap-2">
                             <View className="w-3 h-3 bg-blue-500 rounded-full" />
                             <Text className="font-semibold text-gray-700">Fat</Text>
                        </View>
                        <Text className="font-bold text-gray-900">{metrics.daily_fat}g</Text>
                    </View>
                </View>
            </View>

            <View className="h-24" />
        </ScrollView>

        {/* Footer Button - Sticky */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
            <TouchableOpacity 
                className="bg-orange-500 w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30"
                onPress={handleFinish}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className="text-white text-xl font-bold mr-2">Bắt đầu ngay</Text>
                        <Ionicons name="rocket-outline" size={24} color="white" />
                    </>
                )}
            </TouchableOpacity>
        </View>
    </View>
  );
}
