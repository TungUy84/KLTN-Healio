import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Keyboard, TouchableWithoutFeedback, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';
import RulerPicker from '../../components/onboarding/RulerPicker';

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
        if (targetW < currentW) return `Bạn muốn giảm ${(currentW - targetW).toFixed(1).replace(/\.0$/, '')} kg`;
        if (targetW > currentW) return `Bạn muốn tăng ${(targetW - currentW).toFixed(1).replace(/\.0$/, '')} kg`;
        return 'Bạn muốn duy trì cân nặng';
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

                    {/* Pagination Dots (Step 4/5) */}
                    <View className="flex-row gap-2 bg-white/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/50">
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-8 h-2.5 bg-emerald-500 rounded-full shadow-sm" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                    </View>

                    <View className="w-11" />
                </View>

                {/* Header Content */}
                <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-4">
                    <Text className="text-[36px] font-black text-slate-800 text-center mb-3 tracking-tighter shadow-sm">Mục tiêu của bạn</Text>
                    <Text className="text-slate-600 text-center text-[16px] font-medium px-4">
                        Hãy cho chúng tôi biết cân nặng mong muốn của bạn.
                    </Text>
                </Animated.View>
            </SafeAreaView>

            {/* Content Area */}
            <View className="flex-1 px-8 pt-8 pb-12 justify-between">
                <View className="gap-8">
                    {/* AC1: Cân nặng hiện tại (Readonly) */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <Text className="text-slate-700 text-[15px] font-bold mb-3 ml-1 tracking-tight">Cân nặng hiện tại</Text>
                        <View className="flex-row items-center border border-white/40 rounded-[24px] px-5 h-[68px] bg-white/50 backdrop-blur-xl shadow-lg shadow-slate-200/50">
                            <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3 border border-slate-200">
                                <Ionicons name="body" size={20} color="#64748b" />
                            </View>
                            <View className="flex-1 flex-row items-baseline">
                                <Text className="text-[32px] font-black text-slate-500 tracking-tight">
                                    {data.weight || 0}
                                </Text>
                                <Text className="text-slate-400 text-[16px] font-bold ml-1">kg</Text>
                            </View>
                            <View className="bg-slate-200 px-3 py-1.5 rounded-full">
                                <Ionicons name="lock-closed" size={14} color="#94a3b8" />
                            </View>
                        </View>
                    </Animated.View>

                    {/* AC1: Ô nhập Cân nặng mục tiêu (RulerPicker) */}
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                        <View className="bg-white/60 p-6 rounded-[32px] border border-white/60 shadow-xl shadow-emerald-200/50 backdrop-blur-xl relative overflow-hidden">
                            <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-20" />
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-slate-800 text-[18px] font-black tracking-tight">Cân nặng mong muốn</Text>
                                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center shadow-sm">
                                    <Ionicons name="trophy" size={20} color="#10b981" />
                                </View>
                            </View>

                            <RulerPicker
                                min={30}
                                max={200}
                                step={1}
                                initialValue={targetW > 0 ? targetW : (currentW || 60)}
                                unit="kg"
                                onValueChange={(val) => {
                                    setGoalWeight(val.toString());
                                    updateData({ goalWeight: val.toString() });
                                }}
                            />
                        </View>
                    </Animated.View>

                    {/* AC3: Hiển thị phân tích (Tự động so sánh) */}
                    {targetW > 0 && currentW > 0 && (
                        <Animated.View entering={FadeInDown.delay(400).springify()} className="flex-row items-center justify-center gap-2 mt-2">
                            {/* <Ionicons
                                name={targetW < currentW ? "trending-down" : targetW > currentW ? "trending-up" : "remove"}
                                size={20}
                                color={targetW < currentW ? "#ea580c" : targetW > currentW ? "#2563eb" : "#059669"}
                            /> */}
                            <Text className={`font-bold text-[16px] ${targetW < currentW ? 'text-orange-600' :
                                targetW > currentW ? 'text-blue-600' :
                                    'text-emerald-600'
                                }`}>
                                {getReason()}
                            </Text>
                        </Animated.View>
                    )}
                </View>

                {/* Footer Button - Style nút To */}
                <Animated.View entering={FadeInDown.delay(500).springify()} className="w-full mt-4">
                    <Pressable
                        className={`h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-xl transition-all active:scale-[0.98] active:opacity-90 ${!goalWeight ? 'bg-slate-300 shadow-transparent' : 'bg-slate-900 shadow-slate-900/20'
                            }`}
                        onPress={handleNext}
                        disabled={!goalWeight}
                    >
                        <View className="pl-6 flex-1 items-center">
                            <Text className="text-white text-[18px] font-bold tracking-wide text-center">Tiếp tục</Text>
                        </View>
                        <View className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${!goalWeight ? 'bg-slate-400' : 'bg-emerald-500 shadow-emerald-500/50'}`}>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </View>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}
