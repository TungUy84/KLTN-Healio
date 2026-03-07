import React, { useState } from 'react';
import { View, Text, Pressable, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';
import RulerPicker from '../../components/onboarding/RulerPicker';

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
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AnimatedBackground color1="#10B981" color2="#34D399" color3="#059669" />

            {/* Header Style */}
            <SafeAreaView edges={['top']} className="px-8 pb-4 pt-6">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6">
                    <Pressable onPress={() => router.back()} className="w-11 h-11 bg-white/40 rounded-full items-center justify-center active:bg-white/60 backdrop-blur-md border border-white/50 shadow-sm shadow-emerald-100">
                        <Ionicons name="arrow-back" size={24} color="#064e3b" />
                    </Pressable>

                    {/* Pagination Dots (Step 2/5) */}
                    <View className="flex-row gap-2 bg-white/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/50">
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-8 h-2.5 bg-emerald-500 rounded-full shadow-sm" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                    </View>

                    <View className="w-11" />
                </View>

                {/* Header Content */}
                <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-4">
                    <Text className="text-[36px] font-black text-slate-800 text-center mb-3 tracking-tighter shadow-sm">Chỉ số cơ thể</Text>
                    <Text className="text-slate-600 text-center text-[16px] font-medium px-4">
                        Giúp Healio tính toán chính xác nhu cầu calo của bạn.
                    </Text>
                </Animated.View>
            </SafeAreaView>

            {/* Content Area */}
            <View className="flex-1 px-8 pt-8 pb-12 justify-between">

                <View className="gap-10">
                    {/* 1. Chiều cao (RulerPicker) */}
                    <Animated.View entering={FadeInDown.delay(200).springify()} className="bg-white/60 p-6 rounded-[32px] border border-white/60 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-slate-700 text-[16px] font-bold tracking-tight">Chiều cao</Text>
                            <Ionicons name="resize" size={20} color="#10B981" />
                        </View>
                        <RulerPicker
                            min={100}
                            max={250}
                            step={1}
                            initialValue={height ? parseInt(height) : 170}
                            unit="cm"
                            onValueChange={(val) => setHeight(val.toString())}
                        />
                    </Animated.View>

                    {/* 2. Cân nặng (RulerPicker) */}
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="bg-white/60 p-6 rounded-[32px] border border-white/60 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-slate-700 text-[16px] font-bold tracking-tight">Cân nặng</Text>
                            <Ionicons name="scale" size={20} color="#10B981" />
                        </View>
                        <RulerPicker
                            min={30}
                            max={200}
                            step={1}
                            initialValue={weight ? parseInt(weight) : 60}
                            unit="kg"
                            onValueChange={(val) => setWeight(val.toString())}
                        />
                    </Animated.View>
                </View>

                {/* Footer Button */}
                <Animated.View entering={FadeInDown.delay(400).springify()} className="w-full mt-4">
                    <Pressable
                        className={`h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-xl transition-all active:scale-[0.98] active:opacity-90 ${(!height || !weight) ? 'bg-slate-300 shadow-transparent' : 'bg-slate-900 shadow-slate-900/20'
                            }`}
                        onPress={handleNext}
                        disabled={!height || !weight}
                    >
                        <View className="pl-6 flex-1 items-center">
                            <Text className="text-white text-[18px] font-bold tracking-wide text-center">Tiếp tục</Text>
                        </View>
                        <View className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${(!height || !weight) ? 'bg-slate-400' : 'bg-emerald-500 shadow-emerald-500/50'}`}>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </View>
                    </Pressable>
                </Animated.View>

            </View>
        </View>
    );
}