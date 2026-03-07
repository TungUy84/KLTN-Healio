import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, ImageBackground, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Flame, Wheat, Beef, Droplet, Sparkles, Coffee, Sun, Moon, Utensils } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userService, CalculatedMetrics } from '../../services/userService';
import { foodService } from '../../services/foodService';
import { aiService, MealPlanSuggestion } from '../../services/aiService';
import { AnimatedProgressBar } from '../../components/ui/AnimatedProgressBar';
import { AnimatedCalorieGauge } from '../../components/ui/AnimatedCalorieGauge';
import { useWalkthrough } from '../../context/WalkthroughContext';
import { InteractionManager } from 'react-native';
import { authService } from '../../services/authService';

const CACHE_KEY = '@ai_meal_plan_cache';
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://10.0.2.2:5000';

// Hàm lấy URI ảnh an toàn
const getImageUri = (image: string | undefined | null): string | null => {
    if (!image) return null;
    return image.startsWith('http') ? image : `${IMAGE_BASE_URL}${image}`;
};

export default function AiPlanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [aiLoading, setAiLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [mealPlan, setMealPlan] = useState<MealPlanSuggestion | null>(null);
    const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
    const mountTime = React.useRef(Date.now());

    useEffect(() => {
        loadOrGeneratePlan(false);
        userService.getCalculatedMetrics().then(setMetrics).catch(() => { });
    }, []);

    // Walkthrough Logic
    const { startWalkthrough, registerStep, unregisterStep } = useWalkthrough();
    const step1Ref = React.useRef<View>(null);
    const step2Ref = React.useRef<View>(null);

    useEffect(() => {
        registerStep("ai_step1", step1Ref, () => { });
        registerStep("ai_step2", step2Ref, () => { });

        return () => {
            unregisterStep("ai_step1");
            unregisterStep("ai_step2");
        };
    }, []);

    useEffect(() => {
        const checkTutorial = async () => {
            if (!aiLoading && mealPlan) { // Chỉ show sau khi loading xong
                const hasSeen = await authService.checkEpicTutorial('ai-plan');
                if (!hasSeen) {
                    setTimeout(() => {
                        startWalkthrough([
                            { name: 'ai_step1', title: 'Tự động lên Thực Đơn', content: 'Bấm vào đây để AI phân tích lại chỉ số Body của bạn và gợi ý ra một Thực Đơn hoàn toàn mới cho ngày hôm nay' },
                            { name: 'ai_step2', title: 'Giám sát Dinh Dưỡng', content: 'Mức Calo và Macro của thực đơn mẫu sẽ được tính toán bám sát với Mục Tiêu mà hệ thống tính ra cho riêng bạn.' }
                        ], 'ai-plan');
                    }, 50);
                }
            }
        };
        checkTutorial();
    }, [aiLoading, mealPlan, startWalkthrough]);

    const loadOrGeneratePlan = async (forceRegenerate = false) => {
        try {
            setAiLoading(true);
            const tzOffset = new Date().getTimezoneOffset() * 60000;
            const todayStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
            if (!forceRegenerate) {
                const cachedDataStr = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedDataStr) {
                    const cachedData = JSON.parse(cachedDataStr);
                    if (cachedData.date === todayStr && cachedData.plan && Array.isArray(cachedData.plan.breakfast)) {
                        setMealPlan(cachedData.plan);
                        setAiLoading(false);
                        return;
                    }
                }
            }
            const plan = await aiService.suggestMealPlan();
            setMealPlan(plan);
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr, plan }));
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Có lỗi khi phân tích thực đơn bằng AI. Vui lòng thử lại sau.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleApplyMealPlan = async () => {
        if (!mealPlan) return;
        setIsApplying(true);
        try {
            const tzOffset = new Date().getTimezoneOffset() * 60000;
            const dateStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
            const mealsStructure = [
                { items: mealPlan.breakfast, type: 'breakfast' },
                { items: mealPlan.lunch, type: 'lunch' },
                { items: mealPlan.dinner, type: 'dinner' }
            ];
            for (const section of mealsStructure) {
                if (Array.isArray(section.items)) {
                    for (const meal of section.items) {
                        if (meal.food_id) {
                            await foodService.addToDiary({
                                food_id: meal.food_id,
                                meal_type: section.type,
                                quantity: meal.amount,
                                unit_name: meal.detail?.serving_unit || 'suất',
                                date: dateStr
                            });
                        }
                    }
                }
            }
            Alert.alert('Thành công', 'Đã lưu thực đơn gợi ý vào nhật ký!', [
                { text: 'OK', onPress: () => router.navigate('/(tabs)') }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Có lỗi khi lưu thực đơn.');
        } finally {
            setIsApplying(false);
        }
    };

    // Tính macro tổng an toàn
    const safeReduce = (meals: any[] | undefined, key: string) =>
        Array.isArray(meals) ? meals.reduce((sum: number, item: any) => sum + ((item.detail?.[key] || 0) * (item.amount || 0)), 0) : 0;

    const totalCalo = mealPlan?.total_calories || 0;
    const totalCarb = Math.round(safeReduce(mealPlan?.breakfast, 'carb') + safeReduce(mealPlan?.lunch, 'carb') + safeReduce(mealPlan?.dinner, 'carb'));
    const totalProtein = Math.round(safeReduce(mealPlan?.breakfast, 'protein') + safeReduce(mealPlan?.lunch, 'protein') + safeReduce(mealPlan?.dinner, 'protein'));
    const totalFat = Math.round(safeReduce(mealPlan?.breakfast, 'fat') + safeReduce(mealPlan?.lunch, 'fat') + safeReduce(mealPlan?.dinner, 'fat'));

    const targetCalo = metrics?.target_calories || 2000;
    const targetCarb = metrics?.target_carb_g || 250;
    const targetProtein = metrics?.target_protein_g || 150;
    const targetFat = metrics?.target_fat_g || 65;

    // Cấu hình các bữa ăn
    const mealSections = [
        { title: 'Bữa Sáng', Icon: Coffee, iconColor: '#F97316', dataArray: mealPlan?.breakfast },
        { title: 'Bữa Trưa', Icon: Sun, iconColor: '#3B82F6', dataArray: mealPlan?.lunch },
        { title: 'Bữa Tối', Icon: Moon, iconColor: '#6366F1', dataArray: mealPlan?.dinner },
    ];

    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Gradient nền Pink/Rose - dùng style thay className cho LinearGradient */}
            <LinearGradient
                colors={['#FFF0F5', '#FFF0F5', '#FFF7F9']}
                locations={[0, 0.3, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Header */}
            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ backgroundColor: 'rgba(255,255,255,0.6)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={20} color="#374151" />
                    </TouchableOpacity>
                    <View ref={step1Ref}>
                        <TouchableOpacity
                            onPress={() => loadOrGeneratePlan(true)}
                            disabled={aiLoading || isApplying}
                            style={{ backgroundColor: 'rgba(255,255,255,0.6)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', opacity: (aiLoading || isApplying) ? 0.5 : 1 }}
                        >
                            <RefreshCw size={18} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ marginTop: 4 }}>
                    <Text className="text-slate-800 font-black text-2xl tracking-tight">Thực đơn AI</Text>
                    <Text className="text-slate-500 font-medium text-sm mt-1">Gợi ý được cá nhân hóa cho bạn</Text>
                </View>
            </View>

            {/* Loading State */}
            {aiLoading ? (
                <View className="flex-1 justify-center items-center">
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <ActivityIndicator size="large" color="#e11d48" />
                    </View>
                    <Text className="text-slate-700 font-bold text-xl mb-2">AI đang phân tích...</Text>
                    <Text className="text-slate-500 font-medium px-12 text-center leading-6 text-sm">
                        Đang lên thực đơn phù hợp với bạn hôm nay.
                    </Text>
                </View>
            ) : mealPlan ? (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
                >
                    {/* === Macro Banner === */}
                    <View ref={step2Ref} className="bg-white rounded-3xl p-5 mb-5 border border-slate-100 shadow-sm shadow-slate-200">
                        <Text className="text-slate-400 text-xs font-black uppercase tracking-wider mb-4">Tổng Dinh Dưỡng Thực Đơn</Text>
                        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>

                            {/* Trái: Gauge Calo 270° */}
                            <View style={{ width: '40%', alignItems: 'center', top: 10, justifyContent: 'center' }}>
                                <AnimatedCalorieGauge value={totalCalo} target={targetCalo} delay={400} />
                            </View>

                            {/* Separator dọc */}
                            <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: '#e2e8f0' }} />

                            {/* Phải: 3 thanh Macro */}
                            <View className="flex-1" style={{ gap: 12 }}>
                                {/* Đạm */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Beef size={11} color="#3B82F6" />
                                            <Text className="text-slate-500 text-xs font-semibold">Đạm</Text>
                                        </View>
                                        <Text className="text-slate-700 font-black text-xs">
                                            {totalProtein}<Text className="text-slate-400 font-medium"> /{targetProtein}g</Text>
                                        </Text>
                                    </View>
                                    <AnimatedProgressBar progress={(totalProtein / (targetProtein || 1)) * 100} color="#60A5FA" delay={500} />
                                </View>
                                {/* Tinh bột */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Wheat size={11} color="#10B981" />
                                            <Text className="text-slate-500 text-xs font-semibold">Tinh bột</Text>
                                        </View>
                                        <Text className="text-slate-700 font-black text-xs">
                                            {totalCarb}<Text className="text-slate-400 font-medium"> /{targetCarb}g</Text>
                                        </Text>
                                    </View>
                                    <AnimatedProgressBar progress={(totalCarb / (targetCarb || 1)) * 100} color="#10B981" delay={600} />
                                </View>
                                {/* Chất béo */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Droplet size={11} color="#EAB308" />
                                            <Text className="text-slate-500 text-xs font-semibold">Chất béo</Text>
                                        </View>
                                        <Text className="text-slate-700 font-black text-xs">
                                            {totalFat}<Text className="text-slate-400 font-medium"> /{targetFat}g</Text>
                                        </Text>
                                    </View>
                                    <AnimatedProgressBar progress={(totalFat / (targetFat || 1)) * 100} color="#FACC15" delay={700} />
                                </View>
                            </View>
                        </View>

                        {/* Note của AI — gắn trong cùng thẻ */}
                        {mealPlan.note ? (
                            <View className="mt-3 pt-3 border-t border-slate-100">
                                <Text className="text-slate-600 text-xs leading-5">{mealPlan.note}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* === Danh sách Bữa Ăn === */}
                    <View style={{ gap: 28 }}>
                        {mealSections.map((mealSection, index) => {
                            if (!mealSection.dataArray || mealSection.dataArray.length === 0) return null;
                            const { Icon } = mealSection;
                            const featured = mealSection.dataArray[0];
                            const sideItems = mealSection.dataArray.slice(1, 3);
                            const featuredImgUri = getImageUri(featured?.detail?.image);

                            return (
                                <View key={index}>
                                    {/* Tiêu đề bữa */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <Icon size={18} color={mealSection.iconColor} />
                                        <Text className="font-black text-slate-800 text-lg tracking-tight">{mealSection.title}</Text>
                                        <Text className="text-slate-400 font-medium text-xs">{mealSection.dataArray.length} món gợi ý</Text>
                                    </View>

                                    {/* Grid 1 lớn + 2 nhỏ */}
                                    <View style={{ flexDirection: 'row', gap: 12, height: 170 }}>

                                        {/* Card LỚN (Featured) */}
                                        <TouchableOpacity
                                            onPress={() => { if (featured?.detail?.id) router.push(`/food/food-detail?id=${featured.detail.id}` as any); }}
                                            activeOpacity={0.9}
                                            style={{ flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: '#CBD5E1' }}
                                        >
                                            {featuredImgUri ? (
                                                <ImageBackground source={{ uri: featuredImgUri }} style={{ flex: 1 }} resizeMode="cover">
                                                    <LinearGradient
                                                        colors={['transparent', 'rgba(0,0,0,0.75)']}
                                                        style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}
                                                    >
                                                        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginBottom: 8 }}>
                                                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 10 }}>Món chính</Text>
                                                        </View>
                                                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 15, lineHeight: 20, marginBottom: 4 }} numberOfLines={2}>{featured?.detail?.name}</Text>
                                                        {/* Calo + macro — style giống trang chủ (Wheat/Beef/Droplet) */}
                                                        <View className="flex-row items-center gap-1 mb-1">
                                                            <Flame size={12} color="#EA580C" />
                                                            <Text className="text-white font-black text-sm">{Math.round((featured?.detail?.calories || 0) * (featured?.amount || 0))} kcal</Text>
                                                        </View>
                                                        <View className="flex-row gap-2">
                                                            <View className="flex-row items-center gap-1">
                                                                <Wheat size={10} color="#10B981" />
                                                                <Text className="text-white font-semibold" style={{ fontSize: 10 }}>{Math.round((featured?.detail?.carb || 0) * (featured?.amount || 0))}g</Text>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <Beef size={10} color="#3B82F6" />
                                                                <Text className="text-white font-semibold" style={{ fontSize: 10 }}>{Math.round((featured?.detail?.protein || 0) * (featured?.amount || 0))}g</Text>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <Droplet size={10} color="#EAB308" />
                                                                <Text className="text-white font-semibold" style={{ fontSize: 10 }}>{Math.round((featured?.detail?.fat || 0) * (featured?.amount || 0))}g</Text>
                                                            </View>
                                                        </View>
                                                    </LinearGradient>
                                                </ImageBackground>
                                            ) : (
                                                <LinearGradient colors={['#E2E8F0', '#CBD5E1']} style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
                                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Utensils size={40} color="#94A3B8" />
                                                    </View>
                                                    <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.4)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginBottom: 8 }}>
                                                        <Text style={{ color: '#475569', fontWeight: '700', fontSize: 10 }}>Món chính</Text>
                                                    </View>
                                                    <Text style={{ color: '#1e293b', fontWeight: '900', fontSize: 15, lineHeight: 20, marginBottom: 4 }} numberOfLines={2}>{featured?.detail?.name}</Text>
                                                    {/* Calo + macro — style giống trang chủ - no image variant */}
                                                    <View className="flex-row items-center gap-1 mb-1">
                                                        <Flame size={12} color="#EA580C" />
                                                        <Text className="text-slate-800 font-black text-sm">{Math.round((featured?.detail?.calories || 0) * (featured?.amount || 0))} kcal</Text>
                                                    </View>
                                                    <View className="flex-row gap-2">
                                                        <View className="flex-row items-center gap-1">
                                                            <Wheat size={10} color="#10B981" />
                                                            <Text className="text-slate-500 font-semibold" style={{ fontSize: 10 }}>{Math.round((featured?.detail?.carb || 0) * (featured?.amount || 0))}g</Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-1">
                                                            <Beef size={10} color="#3B82F6" />
                                                            <Text className="text-slate-500 font-semibold" style={{ fontSize: 10 }}>{Math.round((featured?.detail?.protein || 0) * (featured?.amount || 0))}g</Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-1">
                                                            <Droplet size={10} color="#EAB308" />
                                                            <Text className="text-slate-500 font-semibold" style={{ fontSize: 10 }}>{Math.round((featured?.detail?.fat || 0) * (featured?.amount || 0))}g</Text>
                                                        </View>
                                                    </View>
                                                </LinearGradient>
                                            )}
                                        </TouchableOpacity>

                                        {/* Stack 2 Card Nhỏ */}
                                        {sideItems.length > 0 && (
                                            <View style={{ width: '42%', gap: 12, justifyContent: sideItems.length === 1 ? 'center' : 'flex-start' }}>
                                                {sideItems.map((item: any, i: number) => {
                                                    const sideImgUri = getImageUri(item?.detail?.image);
                                                    return (
                                                        <TouchableOpacity
                                                            key={i}
                                                            onPress={() => { if (item?.detail?.id) router.push(`/food/food-detail?id=${item.detail.id}` as any); }}
                                                            activeOpacity={0.9}
                                                            style={{ flex: sideItems.length > 1 ? 1 : 0, height: sideItems.length === 1 ? 110 : undefined, backgroundColor: 'white', borderRadius: 20, padding: 10, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' }}
                                                        >
                                                            <View style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                {sideImgUri ? (
                                                                    <Image source={{ uri: sideImgUri }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                                                                ) : (
                                                                    <Utensils size={20} color="#CBD5E1" />
                                                                )}
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text className="text-slate-700 font-bold text-xs leading-4 mb-1" numberOfLines={2}>{item?.detail?.name}</Text>
                                                                <View className="flex-row items-center gap-1">
                                                                    <Flame size={10} color="#EA580C" />
                                                                    <Text className="text-orange-600 font-black" style={{ fontSize: 10 }}>{Math.round((item?.detail?.calories || 0) * (item?.amount || 0))} kcal</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            ) : null}

            {/* Nút Áp Dụng Thực Đơn - float */}
            {!aiLoading && mealPlan && (
                <TouchableOpacity
                    onPress={handleApplyMealPlan}
                    disabled={isApplying}
                    activeOpacity={0.9}
                    style={{ position: 'absolute', left: 54, right: 54, bottom: insets.bottom }}
                >
                    <LinearGradient
                        colors={isApplying ? ['#94A3B8', '#64748B'] : ['#fb7185', '#e11d48']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ height: 56, borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#e11d48', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }}
                    >
                        {isApplying ? (
                            <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                        ) : (
                            <Sparkles size={18} color="white" style={{ marginRight: 6 }} />
                        )}
                        <Text className="text-white font-black text-base tracking-wide">
                            {isApplying ? 'Đang áp dụng...' : 'Áp Dụng Thực Đơn'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}
