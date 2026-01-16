import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
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

  // Auto detect goal type
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
    router.push('/onboarding/step5-diet');
  };

  const getReason = () => {
      if (currentW === 0 || targetW === 0) return 'Nhập cân nặng để xem mục tiêu';
      if (targetW < currentW) return `Bạn muốn giảm ${(currentW - targetW).toFixed(1)} kg 🔥`;
      if (targetW > currentW) return `Bạn muốn tăng ${(targetW - currentW).toFixed(1)} kg 💪`;
      return 'Bạn muốn duy trì cân nặng 🧘';
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        
            {/* Header - Emerald Background */}
            <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
                <SafeAreaView edges={['top']} className="px-6 pb-4">
                    {/* Navbar */}
                    <View className="flex-row justify-between items-center mb-6 mt-2">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/20 rounded-full">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        
                        {/* Pagination Dots */}
                        <View className="flex-row gap-2">
                             <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-8 h-2 bg-white rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                        </View>

                        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                            <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Header Content */}
                    <View className="items-center mt-4">
                         <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                            <Ionicons name="flag-outline" size={40} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-white text-center mb-2">Mục tiêu của bạn</Text>
                        <Text className="text-white/90 text-center text-base">
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
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
                className="flex-1"
            >
                <View className="flex-1 px-6 pt-10 pb-8 justify-between">
                    <View className="gap-6">
                         {/* Info Card */}
                         <View className="bg-gray-50 border border-gray-100 rounded-3xl p-6 items-center">
                            <Text className="text-gray-500 text-sm font-medium mb-1">Cân nặng hiện tại</Text>
                            <Text className="text-3xl font-bold text-gray-800">
                                {data.weight} <Text className="text-lg text-gray-400 font-normal">kg</Text>
                            </Text>
                         </View>

                        {/* Input Section */}
                        <View>
                            <Text className="text-gray-800 text-lg font-semibold mb-3 ml-2">Cân nặng mong muốn (kg)</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <TextInput 
                                    className="text-3xl font-bold text-gray-800 text-center"
                                    keyboardType="numeric"
                                    placeholder="VD: 60"
                                    placeholderTextColor="#d1d5db"
                                    value={goalWeight}
                                    onChangeText={(t) => {
                                        setGoalWeight(t);
                                        updateData({ goalWeight: t });
                                    }}
                                />
                            </View>
                        </View>

                        {/* Analysis Result */}
                        {(() => {
                           const containerClass = targetW && currentW 
                                ? 'mt-2 p-4 rounded-2xl border flex-row items-center gap-4 bg-emerald-50 border-emerald-200' 
                                : 'mt-2 p-4 rounded-2xl border flex-row items-center gap-4 bg-transparent border-transparent';
                           
                           return (
                                <View className={containerClass}>
                                     {targetW && currentW ? (
                                        <>
                                            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                                                <Ionicons 
                                                    name={targetW < currentW ? "trending-down" : targetW > currentW ? "trending-up" : "remove"} 
                                                    size={24} 
                                                    color="#10b981" 
                                                />
                                            </View>
                                            <Text className="text-emerald-700 font-semibold flex-1">
                                                {getReason()}
                                            </Text>
                                        </>
                                     ) : null}
                                </View>
                           );
                        })()}
                    </View>

                    {/* Footer Button - Accent Orange */}
                    {(() => {
                        const btnClass = !goalWeight 
                            ? "bg-orange-500 w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30 opacity-50"
                            : "bg-orange-500 w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30";
                        
                        return (
                            <TouchableOpacity 
                                className={btnClass}
                                onPress={handleNext}
                                disabled={!goalWeight}
                            >
                                <Text className="text-white text-xl font-bold mr-2">Tiếp tục</Text>
                                <Ionicons name="arrow-forward" size={24} color="white" />
                            </TouchableOpacity>
                        );
                    })()}
                </View>
            </KeyboardAvoidingView>
        </View>
    </TouchableWithoutFeedback>
  );
}
