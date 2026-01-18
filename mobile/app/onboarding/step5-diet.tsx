import React from 'react';
import { View, Text, ScrollView, StatusBar, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

const DIET_PRESETS = [
  { 
    code: 'balanced', 
    name: 'Cân bằng', 
    desc: 'Phù hợp đa số người Việt. Đầy đủ nhóm chất.',
    macros: { c: 45, p: 30, f: 25 },
    icon: 'leaf-outline',
    color: '#10b981' // Emerald
  },
  { 
    code: 'high_protein', 
    name: 'High Protein', 
    desc: 'Ăn nhiều đạm, giúp no lâu và xây dựng cơ bắp.',
    macros: { c: 40, p: 35, f: 25 },
    icon: 'barbell-outline',
    color: '#f97316' // Orange
  },
  { 
    code: 'low_carb', 
    name: 'Low Carb', 
    desc: 'Hạn chế tinh bột tối đa. Tăng cường rau xanh.',
    macros: { c: 25, p: 35, f: 40 },
    icon: 'cut-outline',
    color: '#3b82f6' // Blue
  },
  { 
    code: 'high_carb', 
    name: 'High Carb', 
    desc: 'Nhiều năng lượng cho người tập nặng.',
    macros: { c: 50, p: 30, f: 20 },
    icon: 'flash-outline',
    color: '#eab308' // Yellow
  },
  { 
    code: 'keto', 
    name: 'Keto', 
    desc: 'Rất ít Carb, chủ yếu là chất béo.',
    macros: { c: 5, p: 25, f: 70 },
    icon: 'alert-circle-outline',
    color: '#ec4899' // Pink
  },
];

export default function Step5Diet() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    if (!data.dietPresetCode) return;
    router.push('/onboarding/result');
  };

  return (
    <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
    
        {/* Header - Emerald Style (Đồng bộ Step 1, 2, 3, 4) */}
        <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full active:bg-white/30">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    
                    {/* Pagination Dots (Step 5/5) */}
                    <View className="flex-row gap-2">
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-8 h-2 bg-white rounded-full" />
                    </View>

                    {/* Placeholder để cân giữa */}
                    <View className="w-10" />
                </View>

                {/* Header Content */}
                <View className="items-center mt-2">
                     <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                        <Ionicons name="restaurant-outline" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-2">Chế độ dinh dưỡng</Text>
                    <Text className="text-white/90 text-center text-base px-4">
                        Chọn tỷ lệ dinh dưỡng phù hợp với mục tiêu của bạn
                    </Text>
                </View>
            </SafeAreaView>
            
            {/* Decorative circles */}
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
        </View>

        {/* Content Area */}
        <View className="flex-1 px-6 pt-6 pb-8 justify-between">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 -mx-2 px-2">
                <View className="gap-4 pb-4">
                    {DIET_PRESETS.map((diet) => {
                        const isSelected = data.dietPresetCode === diet.code;
                        
                        return (
                            <Pressable 
                                key={diet.code}
                                onPress={() => updateData({ dietPresetCode: diet.code, dietPreset: diet })}
                                className={`p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                                    isSelected 
                                    ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                                    : 'bg-white border-gray-200'
                                }`}
                            >
                                <View className="flex-row items-start mb-3">
                                    {/* Icon Box */}
                                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                                        isSelected ? 'bg-emerald-100' : 'bg-gray-50'
                                    }`}>
                                        <Ionicons 
                                            name={diet.icon as any} 
                                            size={24} 
                                            color={isSelected ? '#10b981' : '#9ca3af'} 
                                        />
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center">
                                            <Text className={`text-lg font-bold ${isSelected ? 'text-emerald-800' : 'text-gray-800'}`}>
                                                {diet.name}
                                            </Text>
                                            
                                            {/* Radio Circle */}
                                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ml-2 ${
                                                isSelected 
                                                ? 'border-emerald-500 bg-emerald-500' 
                                                : 'border-gray-300 bg-transparent'
                                            }`}>
                                                {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                                            </View>
                                        </View>
                                        
                                        <Text className="text-sm text-gray-500 mt-1 leading-5">
                                            {diet.desc}
                                        </Text>
                                    </View>
                                </View>

                                {/* Visual Macro Bar (Tinh tế hơn) */}
                                <View className="mt-2 bg-gray-100 h-2.5 rounded-full flex-row overflow-hidden w-full">
                                    <View style={{ width: `${diet.macros.c}%` }} className="h-full bg-blue-400" />
                                    <View style={{ width: `${diet.macros.p}%` }} className="h-full bg-orange-400" />
                                    <View style={{ width: `${diet.macros.f}%` }} className="h-full bg-yellow-400" />
                                </View>
                                <View className="flex-row justify-between mt-1.5 px-1">
                                    <Text className="text-[10px] text-gray-500 font-medium">Carb {diet.macros.c}%</Text>
                                    <Text className="text-[10px] text-gray-500 font-medium">Đạm {diet.macros.p}%</Text>
                                    <Text className="text-[10px] text-gray-500 font-medium">Béo {diet.macros.f}%</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer Button - Style nút Cam bo tròn */}
            <Pressable 
                onPress={handleNext}
                disabled={!data.dietPresetCode}
                className={`w-full p-5 rounded-full flex-row items-center justify-center shadow-lg transition-all active:scale-[0.98] mt-2 ${
                    data.dietPresetCode 
                    ? 'bg-orange-500 shadow-orange-500/30' 
                    : 'bg-gray-300 opacity-70'
                }`}
            >
                <Text className="text-white text-xl font-bold mr-2">Xem kết quả</Text>
                <Ionicons name="sparkles" size={24} color="white" />
            </Pressable>
        </View>
    </View>
  );
}
