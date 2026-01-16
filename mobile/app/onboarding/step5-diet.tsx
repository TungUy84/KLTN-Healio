import React from 'react';
import { View, Text, ScrollView, StatusBar, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

const DIET_PRESETS = [
  { 
    code: 'balanced', 
    name: 'Cân bằng (Khuyên dùng)', 
    desc: 'Phù hợp đa số người Việt. Đầy đủ nhóm chất.',
    macros: { c: 45, p: 30, f: 25 },
    icon: 'leaf-outline'
  },
  { 
    code: 'high_protein', 
    name: 'High Protein (Tăng cơ)', 
    desc: 'Ăn nhiều đạm, giúp no lâu và xây dựng cơ bắp.',
    macros: { c: 40, p: 35, f: 25 },
    icon: 'barbell-outline'
  },
  { 
    code: 'low_carb', 
    name: 'Low Carb (Giảm cân)', 
    desc: 'Hạn chế tinh bột tối đa. Tăng cường rau xanh.',
    macros: { c: 25, p: 35, f: 40 },
    icon: 'cut-outline'
  },
  { 
    code: 'high_carb', 
    name: 'High Carb (Vận động)', 
    desc: 'Nhiều năng lượng cho người tập nặng.',
    macros: { c: 50, p: 30, f: 20 },
    icon: 'flash-outline'
  },
  { 
    code: 'keto', 
    name: 'Keto (Nâng cao)', 
    desc: 'Rất ít Carb, chủ yếu là chất béo.',
    macros: { c: 5, p: 25, f: 70 },
    icon: 'alert-circle-outline'
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
    
        <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full active:bg-white/30">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    
                    <View className="flex-row gap-2">
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-8 h-2 bg-white rounded-full" />
                    </View>

                    <View className="w-10" />
                </View>

                <View className="items-center mt-2">
                     <View className="w-16 h-16 bg-white/20 rounded-full justify-center items-center mb-3 border border-white/30 backdrop-blur-md">
                        <Ionicons name="restaurant-outline" size={32} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-1">Chế độ dinh dưỡng</Text>
                    <Text className="text-white/90 text-center text-sm px-4">
                        Tỷ lệ dinh dưỡng sẽ quyết định hiệu quả mục tiêu của bạn
                    </Text>
                </View>
            </SafeAreaView>
            
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
        </View>

        <View className="flex-1 px-5 pt-6 pb-8 justify-between">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-4">
                <View className="gap-4 py-2">
                    {DIET_PRESETS.map((diet) => {
                        const isSelected = data.dietPresetCode === diet.code;
                        
                        return (
                            <Pressable 
                                key={diet.code}
                                onPress={() => updateData({ dietPresetCode: diet.code, dietPreset: diet })}
                                className={`p-4 rounded-2xl border transition-all active:scale-[0.98] ${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100' : 'bg-white border-gray-200 shadow-sm'}`}
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className={`p-2 rounded-full mr-3 ${isSelected ? 'bg-emerald-200' : 'bg-gray-100'}`}>
                                        <Ionicons name={diet.icon as any} size={20} color={isSelected ? '#059669' : '#6b7280'} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-lg font-bold ${isSelected ? 'text-emerald-800' : 'text-gray-800'}`}>
                                            {diet.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>
                                            {diet.desc}
                                        </Text>
                                    </View>
                                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ml-2 ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-transparent'}`}>
                                        {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                                    </View>
                                </View>

                                <View className="flex-row gap-2 mt-1">
                                    <View className="flex-1 items-center">
                                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                                            <View style={{ width: `${diet.macros.c}%` }} className="h-full bg-blue-400" />
                                        </View>
                                        <Text className="text-[10px] text-gray-500 font-medium">Carb {diet.macros.c}%</Text>
                                    </View>
                                    
                                    <View className="flex-1 items-center">
                                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                                            <View style={{ width: `${diet.macros.p}%` }} className="h-full bg-orange-400" />
                                        </View>
                                        <Text className="text-[10px] text-gray-500 font-medium">Đạm {diet.macros.p}%</Text>
                                    </View>

                                    <View className="flex-1 items-center">
                                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                                            <View style={{ width: `${diet.macros.f}%` }} className="h-full bg-yellow-400" />
                                        </View>
                                        <Text className="text-[10px] text-gray-500 font-medium">Béo {diet.macros.f}%</Text>
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            <Pressable 
                onPress={handleNext}
                disabled={!data.dietPresetCode}
                className={`w-full p-4 rounded-full flex-row items-center justify-center shadow-lg active:opacity-90 ${data.dietPresetCode ? 'bg-orange-500 shadow-orange-500/30' : 'bg-gray-300 opacity-50'}`}
            >
                <Text className="text-white text-xl font-bold mr-2">Xem kết quả</Text>
                <Ionicons name="sparkles" size={20} color="white" />
            </Pressable>
        </View>
    </View>
  );
}