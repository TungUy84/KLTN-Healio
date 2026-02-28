import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    RefreshControl, StatusBar, Image, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { userService } from '../../services/userService';
import { foodService } from '../../services/foodService';

// Dùng cùng base domain với API (bỏ phần /api ở cuối)
const API_ORIGIN = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');

const resolveImage = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};

const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

// --- MACRO PILL ---
const MacroPill = ({ label, value, unit = 'g', color }: any) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#94A3B8', marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B' }}>{value}</Text>
        <Text style={{ fontSize: 11, fontWeight: '500', color: color || '#64748B' }}>{unit}</Text>
    </View>
);

// --- DAILY OVERVIEW CARD ---
const DailyOverviewCard = ({ data }: any) => {
    const consumed = Math.round(data?.totalCalories || 0);
    const target = data?.targetCalories || 2000;
    const progress = Math.min(consumed / target, 1);
    const remaining = Math.max(target - consumed, 0);

    const carbTarget = data?.targetMacros?.carb || 250;
    const proteinTarget = data?.targetMacros?.protein || 150;
    const fatTarget = data?.targetMacros?.fat || 65;

    return (
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <LinearGradient
                colors={['#0F172A', '#1E3A5F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 28, padding: 24, marginBottom: 8 }}
            >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <View>
                        <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                            TỔNG DINH DƯỠNG HÔM NAY
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                            <Text style={{ color: '#34D399', fontSize: 40, fontWeight: '900', lineHeight: 44 }}>
                                {consumed}
                            </Text>
                            <Text style={{ color: '#6EE7B7', fontSize: 16, fontWeight: '700' }}>kcal</Text>
                        </View>
                        <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                            mục tiêu {target} kcal • còn {remaining} kcal
                        </Text>
                    </View>
                    <View style={{
                        width: 64, height: 64, borderRadius: 32,
                        borderWidth: 3, borderColor: '#34D399',
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(52,211,153,0.1)'
                    }}>
                        <MaterialCommunityIcons name="lightning-bolt" size={28} color="#34D399" />
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, height: 8, marginBottom: 20 }}>
                    <View style={{
                        width: `${progress * 100}%`, height: '100%',
                        borderRadius: 8, backgroundColor: progress > 1 ? '#EF4444' : '#34D399'
                    }} />
                </View>

                {/* Macros */}
                <View style={{ flexDirection: 'row', gap: 0 }}>
                    {/* Carb */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#FCD34D', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6, minWidth: 56, alignItems: 'center' }}>
                            <Text style={{ color: '#78350F', fontSize: 16, fontWeight: '800' }}>{Math.round(data?.macros?.carb || 0)}</Text>
                        </View>
                        <Text style={{ color: '#FCD34D', fontSize: 11, fontWeight: '600' }}>Carb</Text>
                        <Text style={{ color: '#78716C', fontSize: 10 }}>/ {carbTarget}g</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 }} />
                    {/* Protein */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#60A5FA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6, minWidth: 56, alignItems: 'center' }}>
                            <Text style={{ color: '#1E3A5F', fontSize: 16, fontWeight: '800' }}>{Math.round(data?.macros?.protein || 0)}</Text>
                        </View>
                        <Text style={{ color: '#60A5FA', fontSize: 11, fontWeight: '600' }}>Protein</Text>
                        <Text style={{ color: '#78716C', fontSize: 10 }}>/ {proteinTarget}g</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 }} />
                    {/* Fat */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#F9A8D4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6, minWidth: 56, alignItems: 'center' }}>
                            <Text style={{ color: '#9D174D', fontSize: 16, fontWeight: '800' }}>{Math.round(data?.macros?.fat || 0)}</Text>
                        </View>
                        <Text style={{ color: '#F9A8D4', fontSize: 11, fontWeight: '600' }}>Fat</Text>
                        <Text style={{ color: '#78716C', fontSize: 10 }}>/ {fatTarget}g</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8 }} />
                    {/* Fiber */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ backgroundColor: '#6EE7B7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6, minWidth: 56, alignItems: 'center' }}>
                            <Text style={{ color: '#065F46', fontSize: 16, fontWeight: '800' }}>{Math.round(data?.macros?.fiber || 0)}</Text>
                        </View>
                        <Text style={{ color: '#6EE7B7', fontSize: 11, fontWeight: '600' }}>Xơ</Text>
                        <Text style={{ color: '#78716C', fontSize: 10 }}>/ 25g</Text>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

// --- FOOD ITEM ROW ---
const FoodRow = ({ food, index }: any) => {
    const img = resolveImage(food.image);
    return (
        <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: index === 0 ? 0 : 0,
        }}>
            {/* Thumbnail */}
            <View style={{
                width: 52, height: 52, borderRadius: 14,
                overflow: 'hidden', marginRight: 12,
                backgroundColor: '#F1F5F9',
                alignItems: 'center', justifyContent: 'center'
            }}>
                {img ? (
                    <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                    <MaterialCommunityIcons name="food-variant" size={24} color="#CBD5E1" />
                )}
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 3 }} numberOfLines={1}>
                    {food.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: '#F1F5F9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                            {food.portion} {food.unit}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#CBD5E1' }}>•</Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>
                        C:{food.carb}g P:{food.protein}g F:{food.fat}g
                    </Text>
                </View>
            </View>

            {/* Calories */}
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#10B981' }}>{food.calories}</Text>
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>kcal</Text>
            </View>
        </View>
    );
};

// --- MEAL CARD ---
const MEAL_CONFIG: Record<string, any> = {
    breakfast: { label: 'Bữa Sáng', icon: 'coffee', gradStart: '#FFF7ED', gradEnd: '#FFEDD5', accentColor: '#F97316', badge: '#FED7AA', iconBg: '#FFF7ED' },
    lunch: { label: 'Bữa Trưa', icon: 'silverware-fork-knife', gradStart: '#EFF6FF', gradEnd: '#DBEAFE', accentColor: '#3B82F6', badge: '#BFDBFE', iconBg: '#EFF6FF' },
    dinner: { label: 'Bữa Tối', icon: 'pot-steam-outline', gradStart: '#F5F3FF', gradEnd: '#EDE9FE', accentColor: '#8B5CF6', badge: '#DDD6FE', iconBg: '#F5F3FF' },
    snack: { label: 'Bữa Phụ', icon: 'food-apple-outline', gradStart: '#FFF1F2', gradEnd: '#FFE4E6', accentColor: '#F43F5E', badge: '#FECDD3', iconBg: '#FFF1F2' },
};

const MealCard = ({ mealType, meal, delay, selectedDate, router }: any) => {
    const cfg = MEAL_CONFIG[mealType];
    const [expanded, setExpanded] = useState(true);
    const hasItems = meal?.items?.length > 0;
    const calories = Math.round(meal?.calories || 0);
    const macros = meal?.macros;

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={{ marginBottom: 16 }}>
            <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                borderWidth: 1.5,
                borderColor: cfg.badge,
                overflow: 'hidden',
                shadowColor: cfg.accentColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3
            }}>
                {/* Card Header */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/calendar/meal/[type]', params: { type: mealType, date: selectedDate } })}
                    style={{ padding: 18 }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                            {/* Icon Badge */}
                            <View style={{
                                width: 52, height: 52, borderRadius: 16,
                                backgroundColor: cfg.gradStart,
                                borderWidth: 1.5, borderColor: cfg.badge,
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <MaterialCommunityIcons name={cfg.icon} size={26} color={cfg.accentColor} />
                            </View>

                            {/* Meal Name + Calories */}
                            <View>
                                <Text style={{ fontSize: 17, fontWeight: '800', color: '#1E293B' }}>{cfg.label}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                    <MaterialCommunityIcons name="fire" size={14} color={cfg.accentColor} />
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: cfg.accentColor }}>
                                        {calories} kcal
                                    </Text>
                                    {hasItems && macros && (
                                        <>
                                            <Text style={{ color: '#E2E8F0', fontWeight: '900' }}>•</Text>
                                            <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '600' }}>
                                                C:{Math.round(macros.carb || 0)} P:{Math.round(macros.protein || 0)} F:{Math.round(macros.fat || 0)}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Right side: Expand + Navigate arrows */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {hasItems && (
                                <TouchableOpacity
                                    onPress={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                    style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: cfg.gradStart, alignItems: 'center', justifyContent: 'center' }}>
                                <Feather name="arrow-right" size={14} color={cfg.accentColor} />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Food Items */}
                {hasItems && expanded && (
                    <View style={{ borderTopWidth: 1, borderTopColor: cfg.badge, paddingHorizontal: 18, paddingTop: 4, paddingBottom: 12 }}>
                        {meal.items.map((food: any, idx: number) => (
                            <View key={food.id || idx}>
                                <FoodRow food={food} index={idx} />
                                {idx < meal.items.length - 1 && (
                                    <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />
                                )}
                            </View>
                        ))}
                        {/* Add food button */}
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/calendar/meal/[type]', params: { type: mealType, date: selectedDate } })}
                            style={{
                                marginTop: 8, paddingVertical: 9, borderRadius: 12,
                                borderWidth: 1.5, borderColor: cfg.badge,
                                borderStyle: 'dashed',
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                        >
                            <Feather name="plus" size={14} color={cfg.accentColor} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.accentColor }}>Thêm món ăn</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!hasItems && (
                    <View style={{ borderTopWidth: 1, borderTopColor: cfg.badge, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <MaterialCommunityIcons name="silverware" size={18} color="#CBD5E1" />
                        <Text style={{ color: '#CBD5E1', fontSize: 13, fontStyle: 'italic' }}>Chưa có món ăn nào được log</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/calendar/meal/[type]', params: { type: mealType, date: selectedDate } })}
                            style={{ backgroundColor: cfg.gradStart, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: cfg.accentColor }}>+ Thêm</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

// --- MAIN SCREEN ---
export default function CalendarScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dailyLog, setDailyLog] = useState<any>(null);

    // Nhận ngày từ Full Calendar
    useEffect(() => {
        if (params?.selectedDate) {
            const d = new Date(params.selectedDate as string);
            if (!isNaN(d.getTime())) setSelectedDate(d);
        }
    }, [params?.selectedDate]);

    const toLocalDateStr = (dateObj: Date) => {
        const tzOffset = dateObj.getTimezoneOffset() * 60000;
        return new Date(dateObj.getTime() - tzOffset).toISOString().split('T')[0];
    };

    const fetchDailyData = useCallback(async (dateObj: Date) => {
        try {
            setIsLoading(true);
            const dateStr = toLocalDateStr(dateObj);

            const [metricsData, logsData] = await Promise.all([
                userService.getCalculatedMetrics(),
                foodService.getDailyLog(dateStr),
            ]);

            const newLog: any = {
                totalCalories: 0,
                targetCalories: metricsData?.target_calories || 2000,
                targetMacros: {
                    carb: metricsData?.target_carb_g || 250,
                    protein: metricsData?.target_protein_g || 150,
                    fat: metricsData?.target_fat_g || 65,
                },
                macros: { carb: 0, protein: 0, fat: 0, fiber: 0 },
                meals: {
                    breakfast: { calories: 0, macros: { carb: 0, protein: 0, fat: 0, fiber: 0 }, items: [] },
                    lunch: { calories: 0, macros: { carb: 0, protein: 0, fat: 0, fiber: 0 }, items: [] },
                    dinner: { calories: 0, macros: { carb: 0, protein: 0, fat: 0, fiber: 0 }, items: [] },
                    snack: { calories: 0, macros: { carb: 0, protein: 0, fat: 0, fiber: 0 }, items: [] },
                }
            };

            if (Array.isArray(logsData)) {
                logsData.forEach((log: any) => {
                    const type: string = log.meal_type || 'snack';
                    const mealBucket = newLog.meals[type];

                    const cal = log.calories || 0;
                    const carb = log.carb || 0;
                    const protein = log.protein || 0;
                    const fat = log.fat || 0;
                    const fiber = log.fiber || 0;

                    if (mealBucket) {
                        mealBucket.calories += cal;
                        mealBucket.macros.carb += carb;
                        mealBucket.macros.protein += protein;
                        mealBucket.macros.fat += fat;
                        mealBucket.macros.fiber += fiber;
                        mealBucket.items.push({
                            id: log.id,
                            name: log.food?.name || 'Món ăn',
                            portion: log.amount || 1,
                            unit: log.food?.serving_unit || 'phần',
                            calories: Math.round(cal),
                            carb: Math.round(carb),
                            protein: Math.round(protein),
                            fat: Math.round(fat),
                            fiber: Math.round(fiber),
                            image: resolveImage(log.food?.image),
                        });
                    }

                    newLog.totalCalories += cal;
                    newLog.macros.carb += carb;
                    newLog.macros.protein += protein;
                    newLog.macros.fat += fat;
                    newLog.macros.fiber += fiber;
                });
            }

            setDailyLog(newLog);
        } catch (err) {
            console.error('Calendar fetchDailyData error:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fetchDailyData(selectedDate);
    }, [selectedDate, fetchDailyData]));

    const dateStr = toLocalDateStr(selectedDate);

    return (
        <LinearGradient
            colors={['#E0FDF4', '#EFF6FF', '#F5F3FF', '#FDF2F8']}
            locations={[0, 0.3, 0.65, 1]}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{
                paddingTop: insets.top + 12,
                paddingHorizontal: 20, paddingBottom: 12,
                backgroundColor: 'transparent',
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ fontSize: 26, fontWeight: '900', color: '#0F172A' }}>Lịch Biểu</Text>
                        <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '500' }}>Nhật ký dinh dưỡng hàng ngày</Text>
                    </View>
                    <TouchableOpacity style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                        <Feather name="bar-chart-2" size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDailyData(selectedDate); }} colors={['#10B981']} />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
            >
                {/* Date Selector */}
                <Animated.View entering={FadeInUp.delay(50).duration(400)} style={{ marginVertical: 16 }}>
                    <TouchableOpacity
                        onPress={() => router.push('/calendar')}
                        style={{
                            flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
                            backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12,
                            borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0',
                            shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
                            gap: 10
                        }}
                    >
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                            <Feather name="calendar" size={16} color="#10B981" />
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                            {dayNames[selectedDate.getDay()]}, {selectedDate.getDate()} tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}
                        </Text>
                        <Feather name="chevron-down" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Overview Card */}
                {isLoading ? (
                    <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#10B981" />
                        <Text style={{ marginTop: 12, color: '#94A3B8', fontSize: 13 }}>Đang tải dữ liệu...</Text>
                    </View>
                ) : (
                    <>
                        <DailyOverviewCard data={dailyLog} />

                        {/* Divider */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8' }}>CÁC BỮA ĂN</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                        </View>

                        {/* Meal Cards */}
                        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type, i) => (
                            <MealCard
                                key={type}
                                mealType={type}
                                meal={dailyLog?.meals?.[type]}
                                delay={i * 100}
                                selectedDate={dateStr}
                                router={router}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </LinearGradient>
    );
}
