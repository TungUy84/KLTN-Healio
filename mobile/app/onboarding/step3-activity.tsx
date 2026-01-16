import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít tập luyện' },
  { key: 'light', label: 'Nhẹ', desc: 'Tập 1-3 ngày/tuần' },
  { key: 'moderate', label: 'Trung bình', desc: 'Tập 3-5 ngày/tuần' },
  { key: 'active', label: 'Năng động', desc: 'Tập 6-7 ngày/tuần' },
  { key: 'very_active', label: 'Rất năng động', desc: 'Vận động viên, lao động nặng' },
];

export default function Step3Activity() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    if (!data.activityLevel) return;
    router.push('/onboarding/step4-goal');
  };

  return (
    <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
    
        <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/20 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    
                    <View className="flex-row gap-2">
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-8 h-2 bg-white rounded-full bg-white" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                    </View>

                    <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                         <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-4">
                     <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                        <Ionicons name="fitness-outline" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-2">Mức độ vận động</Text>
                    <Text className="text-white/90 text-center text-base">
                        Chọn mức độ phù hợp nhất với thói quen của bạn
                    </Text>
                </View>
            </SafeAreaView>
            
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
        </View>

        <View className="flex-1 px-6 pt-6 pb-8 justify-between">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-4">
                <View className="gap-4 py-2">
                    {ACTIVITY_LEVELS.map((level) => {
                        const isSelected = data.activityLevel === level.key;
                        
                        return (
                            <TouchableOpacity 
                                key={level.key}
                                onPress={() => updateData({ activityLevel: level.key as any })}
                                className={`flex-row items-center p-5 rounded-2xl border ${
                                    isSelected 
                                    ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <View className="flex-1">
                                    <Text className={`text-lg font-bold mb-1 ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
                                        {level.label}
                                    </Text>
                                    <Text className={`text-sm ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                                        {level.desc}
                                    </Text>
                                </View>
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                }`}>
                                    {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <TouchableOpacity 
                className={`w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${
                    !data.activityLevel ? 'bg-gray-300 opacity-50' : 'bg-orange-500'
                }`}
                onPress={handleNext}
                disabled={!data.activityLevel}
            >
                <Text className="text-white text-xl font-bold mr-2">Tiếp tục</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
        </View>
    </View>
  );
}
