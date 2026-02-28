import React, { useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    StatusBar, ActivityIndicator, Image, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { foodService } from '../../../services/foodService';

// Dùng cùng base domain với API
const API_ORIGIN = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');

const resolveImage = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};

const MEAL_CONFIG: Record<string, any> = {
    breakfast: {
        label: 'Bữa Sáng', iconMci: 'food-croissant',
        gradColors: ['#F97316', '#FB923C'] as [string, string],
        accentColor: '#F97316', badge: '#FED7AA', badgeClass: 'bg-orange-100',
    },
    lunch: {
        label: 'Bữa Trưa', iconMci: 'silverware-fork-knife',
        gradColors: ['#3B82F6', '#60A5FA'] as [string, string],
        accentColor: '#3B82F6', badge: '#BFDBFE', badgeClass: 'bg-blue-100',
    },
    dinner: {
        label: 'Bữa Tối', iconMci: 'pot-steam-outline',
        gradColors: ['#8B5CF6', '#A78BFA'] as [string, string],
        accentColor: '#8B5CF6', badge: '#DDD6FE', badgeClass: 'bg-violet-100',
    },
    snack: {
        label: 'Bữa Phụ', iconMci: 'food-apple-outline',
        gradColors: ['#F43F5E', '#FB7185'] as [string, string],
        accentColor: '#F43F5E', badge: '#FECDD3', badgeClass: 'bg-rose-100',
    },
};

// --- MACRO BADGE (dùng dynamic color nên giữ style cho color) ---
const MacroBadge = ({ label, value, color, bg }: any) => (
    <View className="flex-1 items-center">
        <View className="w-full items-center rounded-xl py-2 px-3" style={{ backgroundColor: bg }}>
            <Text className="text-xl font-black" style={{ color }}>{value}</Text>
            <Text className="text-[11px] font-semibold" style={{ color, opacity: 0.7 }}>g</Text>
        </View>
        <Text className="text-[11px] font-semibold text-slate-400 mt-1.5">{label}</Text>
    </View>
);

// --- FOOD ITEM CARD ---
const FoodItemCard = ({ item, index, onDelete }: any) => {
    const img = resolveImage(item.image);

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(400)}
            className="bg-white rounded-[20px] mb-3 border-[1.5px] border-slate-100 overflow-hidden shadow-sm shadow-slate-200"
        >
            <View className="flex-row items-stretch">
                {/* Image */}
                <View className="w-22 h-22 bg-slate-50">
                    {img ? (
                        <Image source={{ uri: img }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="flex-1 items-center justify-center bg-slate-100">
                            <MaterialCommunityIcons name="food-variant" size={36} color="#CBD5E1" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="flex-1 p-3.5 justify-between">
                    {/* Name + Calories */}
                    <View className="flex-row justify-between items-start">
                        <Text className="flex-1 text-[15px] font-black text-slate-800 mr-2 leading-5" numberOfLines={2}>
                            {item.name}
                        </Text>
                        <View className="items-end">
                            <Text className="text-lg font-black text-emerald-500">{item.calories}</Text>
                            <Text className="text-[10px] font-semibold text-slate-400">kcal</Text>
                        </View>
                    </View>

                    {/* Quantity + Macro chips */}
                    <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                        <View className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                            <Text className="text-[13px] font-bold text-emerald-700">
                                {item.quantity} {item.unit}
                            </Text>
                        </View>
                        <View className="flex-row gap-1">
                            <View className="bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5">
                                <Text className="text-[11px] font-semibold text-amber-600">C {Math.round(item.carbs || 0)}g</Text>
                            </View>
                            <View className="bg-blue-50 border border-blue-100 rounded-md px-1.5 py-0.5">
                                <Text className="text-[11px] font-semibold text-blue-600">P {Math.round(item.protein || 0)}g</Text>
                            </View>
                            <View className="bg-rose-50 border border-rose-100 rounded-md px-1.5 py-0.5">
                                <Text className="text-[11px] font-semibold text-rose-500">F {Math.round(item.fat || 0)}g</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Actions column */}
                <View className="bg-slate-50 border-l border-slate-100 justify-center px-2 gap-2">
                    <TouchableOpacity className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center">
                        <Feather name="edit-2" size={14} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 items-center justify-center"
                    >
                        <Feather name="trash-2" size={14} color="#F43F5E" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

// --- MAIN SCREEN ---
export default function MealDetailScreen() {
    const { type, date } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [foodItems, setFoodItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const cfg = MEAL_CONFIG[(type as string)] || MEAL_CONFIG['breakfast'];

    const fetchMealData = async () => {
        try {
            setIsLoading(true);
            const logs = await foodService.getDailyLog(date as string);
            const mealLogs = logs.filter((log: any) => log.meal_type === type);
            const formattedItems = mealLogs.map((log: any) => ({
                id: log.id,
                name: log.food?.name || 'Món ăn',
                calories: Math.round(log.calories || 0),
                carbs: Math.round(log.carb || 0),
                protein: Math.round(log.protein || 0),
                fat: Math.round(log.fat || 0),
                fiber: Math.round(log.fiber || 0),
                quantity: log.amount || 1,
                unit: log.food?.serving_unit || 'phần',
                image: resolveImage(log.food?.image),
            }));
            setFoodItems(formattedItems);
        } catch (error) {
            console.error('Error fetching meal data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        if (date && type) fetchMealData();
    }, [date, type]));

    const handleDelete = (id: number) => {
        Alert.alert('Xóa món ăn', 'Bạn chắc chắn muốn xóa món này?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => { /* TODO: API delete */ } }
        ]);
    };

    // Totals
    const totalCalories = foodItems.reduce((s, i) => s + i.calories, 0);
    const totalCarbs = Math.round(foodItems.reduce((s, i) => s + i.carbs, 0));
    const totalProtein = Math.round(foodItems.reduce((s, i) => s + i.protein, 0));
    const totalFat = Math.round(foodItems.reduce((s, i) => s + i.fat, 0));
    const totalFiber = Math.round(foodItems.reduce((s, i) => s + i.fiber, 0));

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header Gradient */}
            <LinearGradient
                colors={cfg.gradColors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 8, paddingBottom: 28, paddingHorizontal: 20 }}
            >
                {/* Top Nav */}
                <View className="flex-row items-center mb-5">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Chi tiết thực đơn
                        </Text>
                        <Text className="text-xl font-black text-white">{cfg.label}</Text>
                    </View>
                    <View className="rounded-xl px-3.5 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        <Text className="text-xs font-semibold text-white">{date as string}</Text>
                    </View>
                </View>

                {/* Summary Panel */}
                <View className="rounded-[20px] p-4 border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    {/* Calories row */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                Tổng năng lượng
                            </Text>
                            <View className="flex-row items-baseline gap-1 mt-0.5">
                                <Text className="text-4xl font-black text-white">{totalCalories}</Text>
                                <Text className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>kcal</Text>
                            </View>
                        </View>
                        <View className="w-14 h-14 rounded-[18px] items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
                            <MaterialCommunityIcons name={cfg.iconMci} size={30} color="#fff" />
                        </View>
                    </View>

                    {/* Macros Row */}
                    <View className="flex-row gap-2">
                        <MacroBadge label="Carb" value={totalCarbs} color="#78350F" bg="rgba(253,224,71,0.9)" />
                        <MacroBadge label="Protein" value={totalProtein} color="#1E3A5F" bg="rgba(147,197,253,0.9)" />
                        <MacroBadge label="Fat" value={totalFat} color="#9D174D" bg="rgba(249,168,212,0.9)" />
                        <MacroBadge label="Xơ" value={totalFiber} color="#065F46" bg="rgba(110,231,183,0.9)" />
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            >
                {/* List header */}
                <View className="flex-row items-center mb-4">
                    <Text className="flex-1 text-[18px] font-black text-slate-800">Danh Sách Món Ăn</Text>
                    <View className="px-2.5 py-1 rounded-xl" style={{ backgroundColor: cfg.badge }}>
                        <Text className="text-[13px] font-bold" style={{ color: cfg.accentColor }}>
                            {foodItems.length} món
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View className="py-16 items-center justify-center">
                        <ActivityIndicator size="large" color={cfg.accentColor} />
                        <Text className="text-slate-400 mt-3 text-sm">Đang tải món ăn...</Text>
                    </View>
                ) : foodItems.length === 0 ? (
                    <View className="py-16 items-center">
                        <View className="w-20 h-20 rounded-[24px] items-center justify-center mb-4" style={{ backgroundColor: cfg.badge }}>
                            <MaterialCommunityIcons name="food-off-outline" size={40} color={cfg.accentColor} />
                        </View>
                        <Text className="text-[17px] font-black text-slate-500 mb-1.5">Chưa có món ăn nào</Text>
                        <Text className="text-sm text-slate-400 text-center leading-5">
                            Bữa ăn này chưa được ghi chép.{'\n'}Thêm món bên dưới nhé!
                        </Text>
                    </View>
                ) : (
                    foodItems.map((item, index) => (
                        <FoodItemCard key={item.id || index} item={item} index={index} onDelete={handleDelete} />
                    ))
                )}

                {/* Add Food Button */}
                <TouchableOpacity
                    className="mt-2 py-4 rounded-[18px] border-2 border-dashed flex-row items-center justify-center gap-2"
                    style={{ borderColor: cfg.accentColor, backgroundColor: cfg.badge + '30' }}
                >
                    <View className="w-7 h-7 rounded-lg items-center justify-center" style={{ backgroundColor: cfg.accentColor }}>
                        <Feather name="plus" size={16} color="#fff" />
                    </View>
                    <Text className="text-[15px] font-black" style={{ color: cfg.accentColor }}>
                        Thêm món ăn vào {cfg.label}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
