import React from 'react';
import { View, Text, ScrollView, StatusBar, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';

const ACTIVITY_LEVELS = [
    { key: 'sedentary', label: 'Ít vận động', desc: 'Ngồi nhiều, ít đi lại', icon: 'bed', color: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-400', shadow: 'shadow-indigo-200' },
    { key: 'light', label: 'Nhẹ nhàng', desc: 'Tập 1-3 ngày/tuần', icon: 'walk', color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-400', shadow: 'shadow-emerald-200' },
    { key: 'moderate', label: 'Trung bình', desc: 'Tập 3-5 ngày/tuần', icon: 'bicycle', color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-400', shadow: 'shadow-amber-200' },
    { key: 'active', label: 'Năng động', desc: 'Tập 6-7 ngày/tuần', icon: 'fitness', color: '#ef4444', bg: 'bg-red-50', border: 'border-red-400', shadow: 'shadow-red-200' },
    { key: 'very_active', label: 'Rất năng động', desc: 'Vận động viên chuyên nghiệp', icon: 'flash', color: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-400', shadow: 'shadow-violet-200', fullWidth: true },
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
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AnimatedBackground color1="#10B981" color2="#34D399" color3="#059669" />

            {/* Header Style */}
            <SafeAreaView edges={['top']} className="px-8 pb-4 pt-6">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6">
                    <Pressable onPress={() => router.back()} className="w-11 h-11 bg-white/40 rounded-full items-center justify-center active:bg-white/60 backdrop-blur-md border border-white/50 shadow-sm shadow-emerald-100">
                        <Ionicons name="arrow-back" size={24} color="#064e3b" />
                    </Pressable>

                    {/* Pagination Dots (Step 3/5) */}
                    <View className="flex-row gap-2 bg-white/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/50">
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-8 h-2.5 bg-emerald-500 rounded-full shadow-sm" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                    </View>

                    <View className="w-11" />
                </View>

                {/* Header Content */}
                <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-4">
                    <View className="flex-row items-center bg-white/60 px-4 py-2 rounded-full border border-white mb-6 shadow-sm shadow-emerald-100 backdrop-blur-md">
                        <Ionicons name="fitness" size={16} color="#059669" />
                        <Text className="text-emerald-700 font-bold ml-2 tracking-widest text-[12px] uppercase">Thói quen</Text>
                    </View>
                    <Text className="text-[36px] font-black text-slate-800 text-center mb-3 tracking-tighter shadow-sm">Mức độ vận động</Text>
                    <Text className="text-slate-600 text-center text-[16px] font-medium px-4">
                        Chọn cường độ phù hợp nhất với sinh hoạt hàng ngày.
                    </Text>
                </Animated.View>
            </SafeAreaView>

            {/* Content Area */}
            <View className="flex-1 px-8 pt-6 pb-12 justify-between">
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 -mx-2 px-2">
                    <View className="flex-row flex-wrap justify-between gap-y-4 pb-4">
                        {ACTIVITY_LEVELS.map((level, index) => {
                            const isSelected = data.activityLevel === level.key;

                            return (
                                <Animated.View key={level.key} entering={FadeInDown.delay(200 + index * 100).springify()} style={level.fullWidth ? { width: '100%' } : { width: '48%' }}>
                                    <Pressable
                                        onPress={() => updateData({ activityLevel: level.key as any })}
                                        className={`rounded-[32px] border-2 overflow-hidden transition-all active:scale-[0.96] shadow-xl ${isSelected
                                            ? `bg-white ${level.border} ${level.shadow}`
                                            : 'bg-white/60 border-white/60 shadow-slate-200/50 backdrop-blur-xl'
                                            }`}
                                        style={{ height: level.fullWidth ? 100 : 160, padding: 16 }}
                                    >
                                        <View className={`flex-1 ${level.fullWidth ? 'flex-row items-center' : 'items-center justify-center'}`}>
                                            <View className={`w-14 h-14 rounded-full items-center justify-center ${isSelected ? level.bg : 'bg-slate-100'} ${level.fullWidth ? 'mr-4' : 'mb-3'}`}>
                                                <Ionicons name={level.icon as any} size={28} color={isSelected ? level.color : '#94a3b8'} />
                                            </View>
                                            <View className={level.fullWidth ? 'flex-1' : 'items-center'}>
                                                <Text className={`text-[16px] font-black mb-1 text-center tracking-tight ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                                                    {level.label}
                                                </Text>
                                                <Text className={`text-[12px] font-medium text-center ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {level.desc}
                                                </Text>
                                            </View>

                                            {isSelected && level.fullWidth && (
                                                <View className="w-6 h-6 rounded-full items-center justify-center bg-violet-500 shadow-sm shadow-violet-300">
                                                    <Ionicons name="checkmark" size={14} color="white" />
                                                </View>
                                            )}
                                            {isSelected && !level.fullWidth && (
                                                <View className="absolute top-0 right-0 w-6 h-6 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: level.color }}>
                                                    <Ionicons name="checkmark" size={14} color="white" />
                                                </View>
                                            )}
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Footer Button */}
                <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full mt-2">
                    <Pressable
                        onPress={handleNext}
                        disabled={!data.activityLevel}
                        className={`h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-xl transition-all active:scale-[0.98] active:opacity-90 ${!data.activityLevel ? 'bg-slate-300 shadow-transparent' : 'bg-slate-900 shadow-slate-900/20'
                            }`}
                    >
                        <View className="pl-6 flex-1 items-center">
                            <Text className="text-white text-[18px] font-bold tracking-wide text-center">Tiếp tục</Text>
                        </View>
                        <View className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${!data.activityLevel ? 'bg-slate-400' : 'bg-emerald-500 shadow-emerald-500/50'}`}>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </View>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}