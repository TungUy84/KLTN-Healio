import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StatusBar, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useOnboarding } from '../../context/OnboardingContext';
import { calculateMetrics } from '../../utils/calculations';
import { userService } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

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

    return (
        <View className="items-center justify-center relative" style={{ width: size, height: size }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background (Gray) */}
                <Circle cx={center} cy={center} r={radius} stroke="#f3f4f6" strokeWidth={strokeWidth} fill="transparent" />

                {/* Carbs (Green) - Start from -90 */}
                <G rotation="-90" origin={`${center}, ${center}`}>
                    <Circle cx={center} cy={center} r={radius} stroke="#10b981" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * carb) / 100} strokeLinecap="round" />
                </G>

                {/* Protein (Orange) - Start after Carbs */}
                <G rotation={-90 + cAngle} origin={`${center}, ${center}`}>
                    <Circle cx={center} cy={center} r={radius} stroke="#f97316" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * protein) / 100} strokeLinecap="round" />
                </G>

                {/* Fat (Blue) - Start after Protein */}
                <G rotation={-90 + cAngle + pAngle} origin={`${center}, ${center}`}>
                    <Circle cx={center} cy={center} r={radius} stroke="#3b82f6" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * fat) / 100} strokeLinecap="round" />
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
        if (bmi < 24.9) return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-100' };
        if (bmi < 29.9) return { label: 'Thừa cân', color: 'text-orange-500', bg: 'bg-orange-100' };
        return { label: 'Béo phì', color: 'text-red-500', bg: 'bg-red-100' };
    };
    const bmiInfo = getBMIInfo(metrics.bmi);

    const cPercent = data.dietPreset?.macros?.c || 45;
    const pPercent = data.dietPreset?.macros?.p || 30;
    const fPercent = data.dietPreset?.macros?.f || 25;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center">
                <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="chevron-back" size={24} color="#374151" />
                </Pressable>
                <Text className="flex-1 text-center text-lg font-bold text-gray-900 mr-10">Tổng kết chỉ số</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-gray-500 text-center text-sm mb-6 leading-5 px-4">
                    Dựa trên thông tin bạn cung cấp, Healio đã tính toán lộ trình tối ưu cho bạn.
                </Text>

                {/* Hero Card - Green Gradient Look */}
                <View className="bg-emerald-500 rounded-[30px] p-6 mb-6 shadow-md items-center relative overflow-hidden">
                    <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
                    
                    <Text className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">Mục tiêu hàng ngày</Text>
                    <View className="flex-row items-baseline mb-4">
                        <Text className="text-5xl font-extrabold text-white mr-1">{Math.round(metrics.daily_calories).toLocaleString()}</Text>
                        <Text className="text-lg font-medium text-emerald-100">Kcal</Text>
                    </View>
                    
                    <View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center border border-white/30">
                        <Ionicons name="leaf" size={16} color="white" style={{ marginRight: 6 }} />
                        <Text className="text-white font-semibold text-sm">{getGoalLabel(data.goalType)}</Text>
                    </View>
                </View>

                {/* 3 Stats Row: BMI, BMR, TDEE */}
                <View className="flex-row gap-3 mb-6">
                    {/* BMI */}
                    <View className="flex-1 bg-white p-3 rounded-2xl items-center shadow-sm border border-gray-100 py-4">
                        <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="body" size={16} color="#3b82f6" />
                        </View>
                        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">BMI</Text>
                        <Text className="text-gray-800 text-xl font-bold mb-1">{metrics.bmi}</Text>
                        <View className={`px-2 py-0.5 rounded-full ${bmiInfo.bg}`}>
                            <Text className={`text-[10px] font-bold ${bmiInfo.color}`}>{bmiInfo.label}</Text>
                        </View>
                    </View>

                    {/* BMR */}
                    <View className="flex-1 bg-white p-3 rounded-2xl items-center shadow-sm border border-gray-100 py-4">
                        <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="flame" size={16} color="#f97316" />
                        </View>
                        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">BMR</Text>
                        <Text className="text-gray-800 text-xl font-bold mb-1">{Math.round(metrics.bmr).toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[10px]">Kcal/ngày</Text>
                    </View>

                    {/* TDEE */}
                    <View className="flex-1 bg-white p-3 rounded-2xl items-center shadow-sm border border-gray-100 py-4">
                        <View className="w-8 h-8 bg-purple-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="flash" size={16} color="#a855f7" />
                        </View>
                        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">TDEE</Text>
                        <Text className="text-gray-800 text-xl font-bold mb-1">{Math.round(metrics.tdee).toLocaleString()}</Text>
                        <Text className="text-gray-400 text-[10px]">Kcal/ngày</Text>
                    </View>
                </View>

                {/* Macro Distribution */}
                <View className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-lg font-bold text-gray-800">Phân bổ Macro</Text>
                        <View className="bg-gray-100 px-3 py-1 rounded-full">
                            <Text className="text-xs font-semibold text-gray-500">{data.dietPreset?.name || 'Balanced'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between px-2">
                        {/* Donut Chart */}
                        <MacroDonut protein={pPercent} carb={cPercent} fat={fPercent} />

                        {/* Legend */}
                        <View className="flex-1 ml-8 justify-center gap-5">
                            {/* Carbs - Green */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
                                    <Text className="text-gray-600 font-medium text-sm">Carbs</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-900 font-bold text-base">{cPercent}%</Text>
                                    <Text className="text-gray-400 text-xs">{Math.round(metrics.carb || 0)}g</Text>
                                </View>
                            </View>

                            {/* Protein - Orange */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full bg-orange-500 mr-3" />
                                    <Text className="text-gray-600 font-medium text-sm">Protein</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-900 font-bold text-base">{pPercent}%</Text>
                                    <Text className="text-gray-400 text-xs">{Math.round(metrics.protein || 0)}g</Text>
                                </View>
                            </View>

                            {/* Fat - Blue */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                                    <Text className="text-gray-600 font-medium text-sm">Fat</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-900 font-bold text-base">{fPercent}%</Text>
                                    <Text className="text-gray-400 text-xs">{Math.round(metrics.fat || 0)}g</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
                <Pressable 
                    className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg active:scale-[0.98] transition-all ${
                        loading ? 'bg-gray-300' : 'bg-orange-500 shadow-orange-500/30'
                    }`}
                    onPress={handleFinish}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white text-lg font-bold mr-2">Bắt đầu ngay</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
