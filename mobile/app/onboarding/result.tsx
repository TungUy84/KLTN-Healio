import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StatusBar, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useOnboarding } from '../../context/OnboardingContext';
import { calculateMetrics } from '../../utils/calculations';
import { userService } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedProps, withTiming, withDelay, Easing } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Component vẽ biểu đồ tròn (Donut Chart)
const MacroDonut = ({
    protein, carb, fat,
    size = 140,
    strokeWidth = 12
}: { protein: number, carb: number, fat: number, size?: number, strokeWidth?: number }) => {
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const cAngle = (carb / 100) * 360;
    const pAngle = (protein / 100) * 360;
    // const fAngle = (fat / 100) * 360;

    // Animation progress (0 -> 1)
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(400, withTiming(1, {
            duration: 1500,
            easing: Easing.out(Easing.exp)
        }));
    }, []);

    // Create animated props for Carbs
    const carbProps = useAnimatedProps(() => {
        const targetOffset = circumference - (circumference * carb) / 100;
        return {
            strokeDashoffset: circumference - (circumference - targetOffset) * progress.value,
        };
    });

    // Create animated props for Protein
    const proteinProps = useAnimatedProps(() => {
        const targetOffset = circumference - (circumference * protein) / 100;
        return {
            strokeDashoffset: circumference - (circumference - targetOffset) * progress.value,
        };
    });

    // Create animated props for Fat
    const fatProps = useAnimatedProps(() => {
        const targetOffset = circumference - (circumference * fat) / 100;
        return {
            strokeDashoffset: circumference - (circumference - targetOffset) * progress.value,
        };
    });

    return (
        <View className="items-center justify-center relative" style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background (Gray) */}
                <Circle cx={center} cy={center} r={radius} stroke="#f3f4f6" strokeWidth={strokeWidth} fill="transparent" />

                {/* Carbs (Green) - Start from -90 */}
                <G rotation="-90" origin={`${center}, ${center}`}>
                    <AnimatedCircle cx={center} cy={center} r={radius} stroke="#10b981" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} animatedProps={carbProps} strokeLinecap="round" />
                </G>

                {/* Protein (Orange) - Start after Carbs */}
                <G rotation={-90 + cAngle} origin={`${center}, ${center}`}>
                    <AnimatedCircle cx={center} cy={center} r={radius} stroke="#f97316" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} animatedProps={proteinProps} strokeLinecap="round" />
                </G>

                {/* Fat (Blue) - Start after Protein */}
                <G rotation={-90 + cAngle + pAngle} origin={`${center}, ${center}`}>
                    <AnimatedCircle cx={center} cy={center} r={radius} stroke="#3b82f6" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} animatedProps={fatProps} strokeLinecap="round" />
                </G>
            </Svg>

            {/* Center Text */}
            <View className="absolute items-center">
                <Text className="text-gray-400 text-[10px] font-medium mb-0.5">Tỷ lệ</Text>
                <Text className="text-gray-800 text-xl font-bold">100%</Text>
            </View>
        </View>
    );
};

export default function ResultScreen() {
    const router = useRouter();
    const { data } = useOnboarding();
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);

    useEffect(() => {
        if (data.weight && data.height && data.dob && data.gender) {
            try {
                const height = parseFloat(data.height);
                const weight = parseFloat(data.weight);
                const dobDate = data.dob instanceof Date ? data.dob : new Date(data.dob);
                const age = new Date().getFullYear() - dobDate.getFullYear();

                // Chuẩn bị preset
                const dietPresetFormatted = data.dietPreset ? {
                    ...data.dietPreset,
                    carb_ratio: data.dietPreset.macros?.c,
                    protein_ratio: data.dietPreset.macros?.p,
                    fat_ratio: data.dietPreset.macros?.f
                } : undefined;

                const result = calculateMetrics(
                    age, data.gender, weight, height,
                    data.activityLevel, data.goalType, dietPresetFormatted
                );
                setMetrics(result);
            } catch (error) {
                console.error("Calculation Error:", error);
            }
        }
    }, [data]);

    const handleFinish = async () => {
        if (!metrics) return;
        setLoading(true);
        try {
            const payload = {
                gender: data.gender,
                dob: data.dob,
                height: parseFloat(data.height),
                current_weight: parseFloat(data.weight),
                activity_level: data.activityLevel,
                goal_type: data.goalType,
                goal_weight: parseFloat(data.goalWeight || data.weight),
                diet_preset_code: data.dietPreset?.code || 'balanced',
                tdee: Math.round(metrics.tdee),
                bmr: Math.round(metrics.bmr),
                target_calories: Math.round(metrics.daily_calories)
            };

            await userService.completeOnboarding(payload);
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lưu hồ sơ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Hook 3
    const currentTheme = useMemo(() => {
        return data.dietPreset?.theme || ['#10B981', '#34D399', '#059669'];
    }, [data.dietPreset]);

    const cPercent = data.dietPreset?.carb_ratio || 45;
    const pPercent = data.dietPreset?.protein_ratio || 30;
    const fPercent = data.dietPreset?.fat_ratio || 25;

    if (!metrics) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    const getGoalLabel = (goal: string) => {
        switch (goal) {
            case 'lose_weight': return 'Giảm cân';
            case 'gain_weight': return 'Tăng cân';
            default: return 'Giữ cân';
        }
    };

    const getBMIInfo = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-500', bg: 'bg-blue-100' };
        if (bmi < 24.9) return { label: 'Bình thường', color: 'text-emerald-500', bg: 'bg-emerald-100' };
        if (bmi < 29.9) return { label: 'Thừa cân', color: 'text-orange-500', bg: 'bg-orange-100' };
        return { label: 'Béo phì', color: 'text-red-500', bg: 'bg-red-100' };
    };
    const bmiInfo = getBMIInfo(metrics.bmi);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AnimatedBackground color1={currentTheme[0]} color2={currentTheme[1]} color3={currentTheme[2]} />

            {/* Header */}
            <View className="px-8 py-4 pt-6 flex-row items-center border-b border-white/20 z-10">
                <Pressable onPress={() => router.back()} className="w-11 h-11 bg-white/40 rounded-full items-center justify-center active:bg-white/60 backdrop-blur-md shadow-sm border border-white/50">
                    <Ionicons name="chevron-back" size={24} color="#0f172a" />
                </Pressable>
                <Text className="flex-1 text-center text-[22px] font-black text-slate-800 tracking-tight mr-11">Tổng kết lộ trình</Text>
            </View>

            <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <Animated.Text entering={FadeInDown.delay(100).springify()} className="text-slate-700 text-center text-[15px] font-medium mb-8 leading-6 px-2 shadow-sm">
                    Dựa trên thông tin của bạn, Healio đã tạo ra một kỷ nguyên mới cho sức khỏe của bạn.
                </Animated.Text>

                {/* Hero Card - Glassmorphism Look */}
                <Animated.View entering={FadeInDown.delay(200).springify()} className="bg-white/40 rounded-[40px] p-8 mb-8 shadow-2xl shadow-emerald-500/20 items-center relative overflow-hidden border border-white/60 backdrop-blur-2xl">
                    <View className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-20 -mt-20 blur-2xl" />
                    <View className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full -ml-16 -mb-16 blur-2xl" />

                    <View className="bg-white/60 px-5 py-2 rounded-full mb-4 border border-white/80 shadow-sm flex-row items-center">
                        <Ionicons name="flame" size={16} color="#059669" style={{ marginRight: 6 }} />
                        <Text className="text-emerald-800 text-[12px] font-bold uppercase tracking-widest">Mục tiêu hằng ngày</Text>
                    </View>

                    <View className="flex-row items-baseline mb-5">
                        <Text className="text-[64px] font-black text-slate-800 mr-2 tracking-tighter drop-shadow-md">{Math.round(metrics.daily_calories).toLocaleString()}</Text>
                        <Text className="text-[20px] font-bold text-slate-600">Kcal</Text>
                    </View>

                    <View className="bg-slate-800 px-6 py-3 rounded-full flex-row items-center shadow-xl shadow-slate-900/30">
                        <Ionicons name="flag" size={18} color="#bef264" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-[15px] tracking-wide">{getGoalLabel(data.goalType)}</Text>
                    </View>
                </Animated.View>

                {/* 3 Stats Row: BMI, BMR, TDEE */}
                <Animated.View entering={FadeInDown.delay(300).springify()} className="flex-row gap-3 mb-8">
                    {/* BMI */}
                    <View className="flex-1 bg-white/60 p-5 rounded-[28px] items-center border border-white/60 shadow-lg shadow-blue-100 backdrop-blur-xl relative overflow-hidden">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="pulse" size={24} color="#3b82f6" />
                        </View>
                        <Text className="text-slate-500 text-[12px] font-bold uppercase mb-1 tracking-widest">BMI</Text>
                        <Text className="text-slate-800 text-[26px] font-black mb-3 tracking-tight">{metrics.bmi}</Text>
                        <View className={`px-3 py-1.5 rounded-full border shadow-sm ${bmiInfo.bg} ${bmiInfo.color.replace('text-', 'border-').replace('500', '200')}`}>
                            <Text className={`text-[11px] font-bold ${bmiInfo.color}`}>{bmiInfo.label}</Text>
                        </View>
                    </View>

                    <View className="flex-1 gap-3">
                        {/* BMR */}
                        <View className="flex-1 bg-white/60 p-4 rounded-[28px] items-center justify-center border border-white/60 shadow-lg shadow-orange-100 backdrop-blur-xl flex-row">
                            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="bonfire" size={20} color="#f97316" />
                            </View>
                            <View>
                                <Text className="text-slate-500 text-[11px] font-bold uppercase mb-0.5 tracking-widest">BMR</Text>
                                <Text className="text-slate-800 text-[18px] font-black tracking-tight">{Math.round(metrics.bmr)}</Text>
                            </View>
                        </View>

                        {/* TDEE */}
                        <View className="flex-1 bg-white/60 p-4 rounded-[28px] items-center justify-center border border-white/60 shadow-lg shadow-purple-100 backdrop-blur-xl flex-row">
                            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name="flash" size={20} color="#a855f7" />
                            </View>
                            <View>
                                <Text className="text-slate-500 text-[11px] font-bold uppercase mb-0.5 tracking-widest">TDEE</Text>
                                <Text className="text-slate-800 text-[18px] font-black tracking-tight">{Math.round(metrics.tdee)}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Macro Distribution */}
                {/* Macro Distribution */}
                <Animated.View entering={FadeInDown.delay(400).springify()} className="bg-white/60 p-6 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white/60 mb-6 backdrop-blur-xl">
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className="text-[20px] font-black text-slate-800 tracking-tight">Phân bổ chất</Text>
                        <View className="bg-white/80 px-4 py-2 rounded-full shadow-sm border border-slate-100">
                            <Text className="text-[13px] font-bold text-slate-700">{data.dietPreset?.name || 'Cân bằng'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between px-1">
                        {/* Donut Chart */}
                        <MacroDonut protein={pPercent} carb={cPercent} fat={fPercent} />

                        {/* Legend */}
                        <View className="flex-1 ml-6 justify-center gap-6">
                            {/* Carbs - Green */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-4 h-4 rounded-full bg-[#10b981] mr-3 shadow-md shadow-emerald-200 border-2 border-white" />
                                    <Text className="text-slate-700 font-bold text-[15px]">Carbs</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-slate-900 font-black text-[16px]">{cPercent}%</Text>
                                    <Text className="text-slate-500 text-[13px] font-bold">{Math.round(metrics.carb || 0)}g</Text>
                                </View>
                            </View>

                            {/* Protein - Orange */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-4 h-4 rounded-full bg-[#f97316] mr-3 shadow-md shadow-orange-200 border-2 border-white" />
                                    <Text className="text-slate-700 font-bold text-[15px]">Protein</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-slate-900 font-black text-[16px]">{pPercent}%</Text>
                                    <Text className="text-slate-400 text-[12px] font-medium">{Math.round(metrics.protein || 0)}g</Text>
                                </View>
                            </View>

                            {/* Fat - Blue */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-3.5 h-3.5 rounded-full bg-blue-500 mr-3 shadow-sm shadow-blue-200" />
                                    <Text className="text-slate-600 font-bold text-[14px]">Fat</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-slate-900 font-black text-[16px]">{fPercent}%</Text>
                                    <Text className="text-slate-400 text-[12px] font-medium">{Math.round(metrics.fat || 0)}g</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>

            </ScrollView>

            {/* Bottom Button */}
            <View className="absolute bottom-6 left-6 right-6 z-50">
                <Animated.View entering={FadeInDown.delay(500).springify()}>
                    <Pressable
                        className={`w-full h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-2xl active:scale-[0.98] transition-all bg-slate-900 shadow-slate-900/30 overflow-hidden relative`}
                        onPress={handleFinish}
                        disabled={loading}
                    >
                        <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-20" />
                        {loading ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator color="white" />
                            </View>
                        ) : (
                            <>
                                <View className="pl-6 flex-1 items-center">
                                    <Text className="text-white text-[18px] font-bold tracking-wide text-center uppercase">Bắt đầu hành trình</Text>
                                </View>
                                <View className="w-14 h-14 rounded-full items-center justify-center shadow-md bg-emerald-500 shadow-emerald-500/50">
                                    <Ionicons name="rocket" size={24} color="white" />
                                </View>
                            </>
                        )}
                    </Pressable>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
