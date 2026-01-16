import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { userService } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

export default function Step5Diet() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
        setLoading(true);
        const res = await userService.getDietPresets();
        setPresets(res);
    } catch (err) {
        console.log('Load presets failed', err);
        setPresets([
            { code: 'balanced', name: 'Balanced', description: 'Chế độ ăn cân bằng (Khuyên dùng)', carb_ratio: 45, protein_ratio: 30, fat_ratio: 25 },
            { code: 'high_protein', name: 'High Protein', description: 'Giảm mỡ, tăng cơ', carb_ratio: 40, protein_ratio: 35, fat_ratio: 25 },
            { code: 'keto', name: 'Keto', description: 'Nhiều chất béo, ít carb', carb_ratio: 5, protein_ratio: 25, fat_ratio: 70 },
        ]);
    } finally {
        setLoading(false);
    }
  };

  const handleSelect = (preset: any) => {
    updateData({ dietPreset: preset });
  };

  const handleNext = () => {
    if (!data.dietPreset) return;
    router.push('/onboarding/result');
  };

  const isRecommend = (code: string) => {
      if (data.goalType === 'lose_weight' && code === 'high_protein') return true;
      if (data.goalType === 'gain_weight' && code === 'high_carb') return true;
      if (code === 'balanced') return true;
      return false;
  };

  return (
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
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-8 h-2 bg-white rounded-full" />
                    </View>

                    <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                         <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                    </TouchableOpacity>
                </View>

                {/* Header Content */}
                <View className="items-center mt-4">
                     <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                        <Ionicons name="restaurant-outline" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-2">Chế độ ăn</Text>
                    <Text className="text-white/90 text-center text-base">
                         Tỉ lệ dinh dưỡng sẽ được tính dựa trên lựa chọn này
                    </Text>
                </View>
            </SafeAreaView>
            
            {/* Decorative circles */}
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
        </View>

        {/* Content Area */}
        <View className="flex-1 px-6 pt-6 pb-8 justify-between">
             {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-4">
                        <View className="gap-4 pb-4">
                            {presets.map((preset) => {
                                const isSelected = data.dietPreset?.code === preset.code;
                                const recommended = isRecommend(preset.code);

                                let containerClass = 'bg-gray-50 border-gray-200';
                                let textClass = 'text-gray-800';
                                
                                if (isSelected) {
                                    containerClass = 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30';
                                    textClass = 'text-white';
                                }

                                return (
                                <TouchableOpacity 
                                    key={preset.code}
                                    onPress={() => handleSelect(preset)}
                                    className={`p-5 rounded-2xl border relative overflow-hidden ${containerClass}`}
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className={`text-lg font-bold ${textClass}`}>
                                            {preset.name}
                                        </Text>
                                        {recommended && (
                                            <View className="bg-yellow-400 px-3 py-1 rounded-full">
                                                <Text className="text-xs font-bold text-black">Gợi ý</Text>
                                            </View>
                                        )}
                                    </View>
                                    
                                    <Text className={`text-sm mb-4 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                                        {preset.description}
                                    </Text>
                                    
                                    <View className={`h-[1px] w-full mb-4 ${isSelected ? 'bg-white/20' : 'bg-gray-200'}`} />
                                    
                                    <View className="flex-row justify-between">
                                         <View className="items-center flex-1">
                                             <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{preset.protein_ratio}%</Text>
                                             <Text className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Protein</Text>
                                         </View>
                                         <View className={`items-center flex-1 border-l border-r ${isSelected ? 'border-white/20' : 'border-gray-200'}`}>
                                             <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{preset.carb_ratio}%</Text>
                                             <Text className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Carb</Text>
                                         </View>
                                         <View className="items-center flex-1">
                                             <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{preset.fat_ratio}%</Text>
                                             <Text className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>Fat</Text>
                                         </View>
                                    </View>
                                    
                                    {isSelected && (
                                        <View className="absolute top-5 right-5 hidden"> 
                                            {/* Hidden checkmark if not needed due to full color change */}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )})}
                        </View>
                    </ScrollView>

                    {/* Footer Button - Accent Orange */}
                    <TouchableOpacity 
                        className={`bg-orange-500 w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${!data.dietPreset ? 'opacity-50' : ''}`}
                        onPress={handleNext}
                        disabled={!data.dietPreset}
                    >
                        <Text className="text-white text-xl font-bold mr-2">Xem kết quả</Text>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    </View>
  );
}
