import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StatusBar, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

export default function Step2Body() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [height, setHeight] = useState(data.height || '');
  const [weight, setWeight] = useState(data.weight || '');

  const handleNext = () => {
    if (!height || !weight) return;
    updateData({ height, weight });
    router.push('/onboarding/step3-activity');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        
        {/* Header - Emerald Style */}
        <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full active:bg-white/30">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    
                    {/* Pagination Dots (Step 2/5) */}
                    <View className="flex-row gap-2">
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-8 h-2 bg-white rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                    </View>

                    <Pressable onPress={() => router.replace('/(tabs)')}>
                        <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                    </Pressable>
                </View>

                {/* Header Content */}
                <View className="items-center mt-2">
                    <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                        <Ionicons name="body-outline" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-2">Chỉ số cơ thể</Text>
                    <Text className="text-white/90 text-center text-base px-4">
                        Giúp Healio tính toán chính xác nhu cầu calo của bạn
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
                    {/* 1. Chiều cao */}
                    <View>
                        <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Chiều cao</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-20 bg-gray-50 focus:border-emerald-500 transition-colors">
                            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="resize-outline" size={24} color="#10b981" />
                            </View>
                            <TextInput 
                                className="flex-1 text-3xl font-bold text-gray-900 h-full pb-1"
                                placeholder="0"
                                placeholderTextColor="#d1d5db"
                                keyboardType="numeric"
                                maxLength={3}
                                value={height}
                                onChangeText={setHeight}
                            />
                            <Text className="text-gray-500 text-lg font-medium">cm</Text>
                        </View>
                    </View>

                    {/* 2. Cân nặng */}
                    <View>
                        <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Cân nặng</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-20 bg-gray-50 focus:border-emerald-500 transition-colors">
                            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="scale-outline" size={24} color="#f97316" />
                            </View>
                            <TextInput 
                                className="flex-1 text-3xl font-bold text-gray-900 h-full pb-1"
                                placeholder="0"
                                placeholderTextColor="#d1d5db"
                                keyboardType="numeric"
                                maxLength={3}
                                value={weight}
                                onChangeText={setWeight}
                            />
                            <Text className="text-gray-500 text-lg font-medium">kg</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Button */}
                <Pressable 
                    className={`w-full p-5 rounded-full flex-row items-center justify-center shadow-lg transition-all active:scale-[0.98] ${
                        (!height || !weight) ? 'bg-gray-300 opacity-70' : 'bg-orange-500 shadow-orange-500/30'
                    }`}
                    onPress={handleNext}
                    disabled={!height || !weight}
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