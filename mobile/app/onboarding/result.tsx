import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StatusBar, Pressable, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg'; // Đã có trong package.json
import { useOnboarding } from '../../context/OnboardingContext';
import { calculateMetrics } from '../../utils/calculations';
import { userService } from '../../services/userService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Component vẽ biểu đồ tròn (Donut Chart)
const MacroDonut = ({ 
    protein, carb, fat, 
    size = 180, 
    strokeWidth = 15 
}: { protein: number, carb: number, fat: number, size?: number, strokeWidth?: number }) => {
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Tính góc xoay cho từng đoạn (360 độ = 100%)
    const pAngle = (protein / 100) * 360;
    const cAngle = (carb / 100) * 360;
    // const fAngle = (fat / 100) * 360; // Phần còn lại

    return (
        <View className="items-center justify-center" style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                {/* 1. Vòng tròn nền (màu xám nhạt) */}
                <Circle
                    cx={center} cy={center} r={radius}
                    stroke="#F3F4F6" strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* 2. Protein (Màu Cam) - Bắt đầu từ -90 độ (12h) */}
                <G rotation="-90" origin={`${center}, ${center}`}>
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke="#f97316" // Orange-500
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * protein) / 100}
                        strokeLinecap="round"
                    />
                </G>

                {/* 3. Carbs (Màu Xanh) - Xoay tiếp theo sau Protein */}
                <G rotation={-90 + pAngle} origin={`${center}, ${center}`}>
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke="#3b82f6" // Blue-500
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * carb) / 100}
                        strokeLinecap="round"
                    />
                </G>

                {/* 4. Fat (Màu Vàng) - Xoay tiếp theo sau Carb */}
                <G rotation={-90 + pAngle + cAngle} origin={`${center}, ${center}`}>
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke="#eab308" // Yellow-500
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * fat) / 100}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>

            {/* Số liệu ở giữa vòng tròn */}
            <View className="absolute items-center">
                <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">Tỷ lệ</Text>
                <Text className="text-gray-800 text-2xl font-bold">Macro</Text>
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
                
                const result = calculateMetrics(
                    age, data.gender, weight, height,
                    data.activityLevel, data.goalType, data.dietPreset
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
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    // Helper hiển thị BMI
    const getBMIInfo = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (bmi < 24.9) return { label: 'Bình thường', color: 'text-emerald-600', bg: 'bg-emerald-100' };
        if (bmi < 29.9) return { label: 'Thừa cân', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { label: 'Béo phì', color: 'text-red-600', bg: 'bg-red-100' };
    };
    const bmiInfo = getBMIInfo(metrics.bmi);

    // Lấy tỷ lệ % từ dietPreset (fallback về mặc định nếu null)
    const pPercent = data.dietPreset?.macros?.p || 30;
    const cPercent = data.dietPreset?.macros?.c || 50;
    const fPercent = data.dietPreset?.macros?.f || 20;

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#10b981" />
            
            {/* === HEADER === */}
            <View className="bg-emerald-500 pb-12 pt-4 rounded-b-[40px] shadow-lg overflow-hidden">
                <SafeAreaView edges={['top']} className="px-6">
                    <View className="items-center">
                        <Text className="text-emerald-100 font-medium text-sm uppercase tracking-widest mb-2">Mục tiêu hàng ngày</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-6xl font-extrabold text-white">{Math.round(metrics.daily_calories)}</Text>
                            <Text className="text-xl text-emerald-100 font-medium ml-1">Kcal</Text>
                        </View>
                        
                        {/* Chỉ số phụ (TDEE, BMR) */}
                        <View className="flex-row gap-8 mt-6">
                            <View className="items-center">
                                <Text className="text-emerald-100 text-xs mb-1">TDEE (Tiêu hao)</Text>
                                <Text className="text-white font-bold text-lg">{Math.round(metrics.tdee)}</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-emerald-400/50" />
                            <View className="items-center">
                                <Text className="text-emerald-100 text-xs mb-1">BMR (Nghỉ)</Text>
                                <Text className="text-white font-bold text-lg">{Math.round(metrics.bmr)}</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
                {/* Họa tiết nền */}
                <View className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
            </View>

            {/* === BODY CONTENT === */}
            <ScrollView className="flex-1 px-5 -mt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                
                {/* 1. Thẻ BMI */}
                <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Chỉ số BMI</Text>
                        <View className="flex-row items-center">
                            <Text className={`text-3xl font-bold ${bmiInfo.color} mr-3`}>{metrics.bmi}</Text>
                            <View className={`px-3 py-1 rounded-full ${bmiInfo.bg}`}>
                                <Text className={`text-xs font-bold ${bmiInfo.color}`}>{bmiInfo.label}</Text>
                            </View>
                        </View>
                    </View>
                    <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center">
                        <Ionicons name="body" size={24} color="#9ca3af" />
                    </View>
                </View>

                {/* 2. Biểu đồ Macro Tròn (Donut Chart) */}
                <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
                    <Text className="text-gray-800 font-bold text-lg mb-4 text-center">Phân bổ dinh dưỡng</Text>
                    
                    {/* Vòng tròn biểu đồ */}
                    <View className="items-center mb-6">
                        <MacroDonut protein={pPercent} carb={cPercent} fat={fPercent} size={160} strokeWidth={18} />
                    </View>

                    {/* Chú thích chi tiết */}
                    <View className="flex-row justify-between gap-2">
                        {/* Protein */}
                        <View className="flex-1 items-center">
                            <Text className="text-orange-500 font-bold text-lg">{Math.round(metrics.daily_protein)}g</Text>
                            <View className="flex-row items-center gap-1">
                                <View className="w-2 h-2 rounded-full bg-orange-500" />
                                <Text className="text-gray-500 text-xs">Đạm</Text>
                            </View>
                        </View>

                        {/* Carb */}
                        <View className="flex-1 items-center border-l border-r border-gray-100">
                            <Text className="text-blue-500 font-bold text-lg">{Math.round(metrics.daily_carb)}g</Text>
                            <View className="flex-row items-center gap-1">
                                <View className="w-2 h-2 rounded-full bg-blue-500" />
                                <Text className="text-gray-500 text-xs">Carb</Text>
                            </View>
                        </View>

                        {/* Fat */}
                        <View className="flex-1 items-center">
                            <Text className="text-yellow-500 font-bold text-lg">{Math.round(metrics.daily_fat)}g</Text>
                            <View className="flex-row items-center gap-1">
                                <View className="w-2 h-2 rounded-full bg-yellow-500" />
                                <Text className="text-gray-500 text-xs">Béo</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 3. Lời khuyên */}
                <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex-row gap-3">
                    <Ionicons name="bulb" size={24} color="#3b82f6" />
                    <Text className="text-blue-800 text-sm flex-1 leading-5">
                        Dựa trên mục tiêu <Text className="font-bold">{data.goalType === 'lose_weight' ? 'Giảm cân' : data.goalType === 'gain_weight' ? 'Tăng cân' : 'Giữ cân'}</Text>, 
                        chúng tôi đề xuất mức năng lượng {Math.round(metrics.daily_calories)} kcal/ngày.
                    </Text>
                </View>
            </ScrollView>

            {/* === FOOTER BUTTON === */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
                <Pressable 
                    className={`w-full p-4 rounded-full flex-row items-center justify-center shadow-lg active:scale-[0.98] transition-all ${
                        loading ? 'bg-gray-300' : 'bg-orange-500 shadow-orange-500/30'
                    }`}
                    onPress={handleFinish}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white text-xl font-bold mr-2">Bắt đầu ngay</Text>
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
}