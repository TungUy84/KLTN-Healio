import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, Layout, useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';
import { userService } from '../../services/userService';

// Giao diện kết hợp Data trả về và UI properties
interface DietUITheme {
    icon: any;
    color: string;
    theme: string[];
    bgColor: string;
    borderColor: string;
}

// Component hiệu ứng thanh phần trăm (macro) chạy từ 0 -> value
const AnimatedMacroBar = ({ widthPercent, colorClass, delay = 0 }: { widthPercent: number, colorClass: string, delay?: number }) => {
    const widthShared = useSharedValue(0);

    useEffect(() => {
        widthShared.value = withDelay(delay, withTiming(widthPercent, {
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }));
    }, [widthPercent, delay]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${widthShared.value}%`,
        };
    });

    return (
        <Animated.View style={[animatedStyle]} className={`h-full ${colorClass}`} />
    );
};

const UI_THEME_MAP: Record<string, DietUITheme> = {
    balanced: {
        icon: 'leaf',
        color: '#10b981', // Emerald
        theme: ['#10B981', '#34D399', '#059669'],
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500',
    },
    high_protein: {
        icon: 'barbell',
        color: '#f97316', // Orange
        theme: ['#F97316', '#FB923C', '#EA580C'],
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500',
    },
    low_carb: {
        icon: 'cut',
        color: '#3b82f6', // Blue
        theme: ['#3B82F6', '#60A5FA', '#2563EB'],
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500',
    },
    high_carb: {
        icon: 'flash',
        color: '#eab308', // Yellow
        theme: ['#EAB308', '#FACC15', '#CA8A04'],
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500',
    },
    keto: {
        icon: 'water',
        color: '#ec4899', // Pink
        theme: ['#EC4899', '#F472B6', '#DB2777'],
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500',
    }
};

export default function Step5Diet() {
    const router = useRouter();
    const { data, updateData } = useOnboarding();
    const [presets, setPresets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const result = await userService.getDietPresets();
                if (result && result.data) {
                    setPresets(result.data);
                } else if (Array.isArray(result)) { // Fallback trúng mảng trực tiếp
                    setPresets(result);
                }
            } catch (error) {
                console.error("Failed to fetch diet presets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPresets();
    }, []);

    const handleNext = () => {
        if (!data.dietPresetCode) return;
        router.push('/onboarding/result');
    };

    const currentTheme = useMemo(() => {
        const fallbackTheme = UI_THEME_MAP['balanced'].theme;
        if (!presets.length) return fallbackTheme;

        const dietTheme = UI_THEME_MAP[data.dietPresetCode || ''];
        return dietTheme ? dietTheme.theme : fallbackTheme;
    }, [data.dietPresetCode, presets]);

    if (loading) {
        return (
            <View className="flex-1 bg-emerald-50 items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
                <Text className="text-emerald-600 font-bold mt-4">Đang tải cấu hình dinh dưỡng...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AnimatedBackground color1={currentTheme[0]} color2={currentTheme[1]} color3={currentTheme[2]} />

            {/* Header Style */}
            <SafeAreaView edges={['top']} className="px-8 pb-4 pt-6">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6">
                    <Pressable onPress={() => router.back()} className="w-11 h-11 bg-white/40 rounded-full items-center justify-center active:bg-white/60 backdrop-blur-md border border-white/50 shadow-sm shadow-emerald-100">
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </Pressable>

                    {/* Pagination Dots (Step 5/5) */}
                    <View className="flex-row gap-2 bg-white/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/50">
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        <View className="w-8 h-2.5 bg-emerald-500 rounded-full shadow-sm" />
                    </View>

                    <View className="w-11" />
                </View>

                {/* Header Content */}
                <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-4">
                    <View className="flex-row items-center bg-white/60 px-4 py-2 rounded-full border border-white mb-6 shadow-sm shadow-emerald-100 backdrop-blur-md">
                        <Ionicons name="restaurant" size={16} color="#059669" />
                        <Text className="text-emerald-700 font-bold ml-2 tracking-widest text-[12px] uppercase">Dinh dưỡng</Text>
                    </View>
                    <Text className="text-[36px] font-black text-slate-800 text-center mb-3 tracking-tighter shadow-sm">Chế độ ăn đồ</Text>
                    <Text className="text-slate-600 text-center text-[16px] font-medium px-4">
                        Chọn tỷ lệ dinh dưỡng phù hợp với mục tiêu.
                    </Text>
                </Animated.View>
            </SafeAreaView>

            {/* Content Area */}
            <View className="flex-1 px-8 pt-6 pb-12 justify-between">
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 -mx-2 px-2">
                    <View className="gap-5 pb-4">
                        {presets.map((diet, index) => {
                            const isSelected = data.dietPresetCode === diet.code;
                            const ui = UI_THEME_MAP[diet.code] || UI_THEME_MAP['balanced'];

                            return (
                                <Animated.View key={diet.code} entering={FadeInDown.delay(200 + index * 100).springify()} layout={Layout.springify()}>
                                    <Pressable
                                        onPress={() => updateData({ dietPresetCode: diet.code, dietPreset: diet })}
                                        className={`p-5 rounded-[32px] border-2 transition-all active:scale-[0.98] shadow-xl overflow-hidden relative backdrop-blur-xl ${isSelected
                                            ? `bg-white/90 ${ui.borderColor} shadow-${ui.color}/20`
                                            : 'bg-white/60 border-white/60 shadow-slate-200/50'
                                            }`}
                                    >
                                        {isSelected && (
                                            <View className={`absolute top-0 left-0 right-0 h-1 opacity-50`} style={{ backgroundColor: ui.color }} />
                                        )}

                                        <View className="flex-row items-center mb-4">
                                            {/* Icon Box */}
                                            <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 border ${isSelected ? `${ui.bgColor} border-${ui.color}` : 'bg-slate-100 border-slate-200'
                                                }`}>
                                                <Ionicons
                                                    name={ui.icon}
                                                    size={24}
                                                    color={isSelected ? ui.color : '#94a3b8'}
                                                />
                                            </View>

                                            <View className="flex-1">
                                                <Text className={`text-[18px] font-black tracking-tight mb-1 ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
                                                    {diet.name}
                                                </Text>
                                                <Text className={`text-[13px] leading-5 font-medium ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {diet.description || 'Chế độ ăn phù hợp cho bạn.'}
                                                </Text>
                                            </View>

                                            {/* Select Indicator */}
                                            <View className={`w-7 h-7 rounded-full border-2 items-center justify-center ml-2 shadow-sm ${isSelected
                                                ? 'bg-white'
                                                : 'border-slate-300 bg-transparent'
                                                }`}
                                                style={isSelected ? { borderColor: diet.color } : {}}
                                            >
                                                {isSelected && <Ionicons name="checkmark" size={16} color={diet.color} />}
                                            </View>
                                        </View>

                                        {/* Visual Macro Bar (Tính tế hơn, Animation) */}
                                        <View className={`h-3 rounded-full flex-row overflow-hidden w-full ${isSelected ? 'bg-slate-100' : 'bg-slate-200'}`}>
                                            <AnimatedMacroBar widthPercent={diet.carb_ratio} colorClass="bg-emerald-500" delay={400 + index * 100} />
                                            <AnimatedMacroBar widthPercent={diet.protein_ratio} colorClass="bg-orange-500" delay={400 + index * 100} />
                                            <AnimatedMacroBar widthPercent={diet.fat_ratio} colorClass="bg-blue-500" delay={400 + index * 100} />
                                        </View>
                                        <View className="flex-row justify-between mt-3 px-1">
                                            <Text className={`text-[11px] font-bold tracking-wider uppercase ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>Carb <Text className="font-black">{diet.carb_ratio}%</Text></Text>
                                            <Text className={`text-[11px] font-bold tracking-wider uppercase ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>Đạm <Text className="font-black">{diet.protein_ratio}%</Text></Text>
                                            <Text className={`text-[11px] font-bold tracking-wider uppercase ${isSelected ? 'text-yellow-600' : 'text-slate-400'}`}>Béo <Text className="font-black">{diet.fat_ratio}%</Text></Text>
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Footer Button - Style nút Bo to */}
                <Animated.View entering={FadeInDown.delay(700).springify()} className="w-full mt-2">
                    <Pressable
                        onPress={handleNext}
                        disabled={!data.dietPresetCode}
                        className={`h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-xl transition-all active:scale-[0.98] active:opacity-90 ${!data.dietPresetCode ? 'bg-slate-300 shadow-transparent' : 'bg-slate-900 shadow-slate-900/20'
                            }`}
                    >
                        <View className="pl-6 flex-1 items-center">
                            <Text className="text-white text-[18px] font-bold tracking-wide text-center">Xem kết quả</Text>
                        </View>
                        <View className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${!data.dietPresetCode ? 'bg-slate-400' : 'bg-emerald-500 shadow-emerald-500/50'}`}>
                            <Ionicons name="sparkles" size={24} color="white" />
                        </View>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}
