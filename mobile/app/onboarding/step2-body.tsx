import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Dimensions, StatusBar, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
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
                            <View className="w-8 h-2 bg-white rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                            <View className="w-2 h-2 bg-white/30 rounded-full" />
                        </View>

                        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                            <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Header Content */}
                    <View className="items-center mt-4">
                         <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                            <Ionicons name="body-outline" size={40} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-white text-center mb-2">Chỉ số cơ thể</Text>
                        <Text className="text-white/90 text-center text-base">
                            Để tính toán chính xác chỉ số BMI và TDEE của bạn.
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
                    <View className="flex-row gap-6">
                        {/* Height Input */}
                        <View className="flex-1">
                            <Text className="text-gray-800 text-lg font-semibold mb-3 ml-2">Chiều cao (cm)</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <TextInput 
                                    className="text-3xl font-bold text-gray-800 text-center"
                                    keyboardType="numeric"
                                    placeholder="170"
                                    placeholderTextColor="#d1d5db"
                                    value={height}
                                    onChangeText={(t) => {
                                        setHeight(t);
                                        updateData({ height: t });
                                    }}
                                />
                            </View>
                        </View>

                         {/* Weight Input */}
                         <View className="flex-1">
                            <Text className="text-gray-800 text-lg font-semibold mb-3 ml-2">Cân nặng (kg)</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <TextInput 
                                    className="text-3xl font-bold text-gray-800 text-center"
                                    keyboardType="numeric"
                                    placeholder="65"
                                    placeholderTextColor="#d1d5db"
                                    value={weight}
                                    onChangeText={(t) => {
                                        setWeight(t);
                                        updateData({ weight: t });
                                    }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Footer Button - Accent Orange */}
                    <TouchableOpacity 
                        className={`bg-orange-500 w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${(!height || !weight) ? 'opacity-50' : ''}`}
                        onPress={handleNext}
                        disabled={!height || !weight}
                    >
                        <Text className="text-white text-xl font-bold mr-2">Tiếp tục</Text>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    </TouchableWithoutFeedback>
  );
}
