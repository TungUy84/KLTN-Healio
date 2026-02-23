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
        label: 'Bữa Sáng', icon: 'coffee',
        iconMci: 'food-croissant',
        gradColors: ['#F97316', '#FB923C'],
        accentColor: '#F97316', badge: '#FED7AA',
    },
    lunch: {
        label: 'Bữa Trưa', icon: 'sun',
        iconMci: 'silverware-fork-knife',
        gradColors: ['#3B82F6', '#60A5FA'],
        accentColor: '#3B82F6', badge: '#BFDBFE',
    },
    dinner: {
        label: 'Bữa Tối', icon: 'moon',
        iconMci: 'pot-steam-outline',
        gradColors: ['#8B5CF6', '#A78BFA'],
        accentColor: '#8B5CF6', badge: '#DDD6FE',
    },
    snack: {
        label: 'Bữa Phụ', icon: 'coffee',
        iconMci: 'food-apple-outline',
        gradColors: ['#F43F5E', '#FB7185'],
        accentColor: '#F43F5E', badge: '#FECDD3',
    },
};

// --- MACRO BADGE ---
const MacroBadge = ({ label, value, color, bg }: any) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
        <View style={{ backgroundColor: bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, width: '100%', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color }}>{value}</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color, opacity: 0.7 }}>g</Text>
        </View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 }}>{label}</Text>
    </View>
);

// --- FOOD ITEM CARD ---
const FoodItemCard = ({ item, index, onDelete }: any) => {
    const img = resolveImage(item.image);

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(400)}
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                marginBottom: 12,
                borderWidth: 1.5,
                borderColor: '#F1F5F9',
                overflow: 'hidden',
                shadowColor: '#CBD5E1',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                {/* Image */}
                <View style={{ width: 88, height: 88, backgroundColor: '#F8FAFC' }}>
                    {img ? (
                        <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' }}>
                            <MaterialCommunityIcons name="food-variant" size={36} color="#CBD5E1" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
                    {/* Name + Calories row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B', flex: 1, marginRight: 8 }} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#10B981' }}>{item.calories}</Text>
                            <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600' }}>kcal</Text>
                        </View>
                    </View>

                    {/* Quantity Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <View style={{ backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#BBFCDB' }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>
                                {item.quantity} {item.unit}
                            </Text>
                        </View>

                        {/* Macro chips */}
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            <View style={{ backgroundColor: '#FFFBEB', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#D97706' }}>C {Math.round(item.carbs || 0)}g</Text>
                            </View>
                            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563EB' }}>P {Math.round(item.protein || 0)}g</Text>
                            </View>
                            <View style={{ backgroundColor: '#FFF1F2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#E11D48' }}>F {Math.round(item.fat || 0)}g</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Actions column */}
                <View style={{ backgroundColor: '#FAFAFA', borderLeftWidth: 1, borderLeftColor: '#F1F5F9', justifyContent: 'center', paddingHorizontal: 8, gap: 8 }}>
                    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF' }}>
                        <Feather name="edit-2" size={14} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFF1F2' }}
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
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <StatusBar barStyle="light-content" />

            {/* Header Gradient */}
            <LinearGradient
                colors={cfg.gradColors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 8, paddingBottom: 28, paddingHorizontal: 20 }}
            >
                {/* Top Nav */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                    >
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 1 }}>
                            Chi tiết thực đơn
                        </Text>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF' }}>
                            {cfg.label}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>{date as string}</Text>
                    </View>
                </View>

                {/* Summary Panel */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                    {/* Calories */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>Tổng năng lượng</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                                <Text style={{ fontSize: 38, fontWeight: '900', color: '#ffffff' }}>{totalCalories}</Text>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>kcal</Text>
                            </View>
                        </View>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name={cfg.iconMci} size={30} color="#fff" />
                        </View>
                    </View>

                    {/* Macros Row */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E293B', flex: 1 }}>
                        Danh Sách Món Ăn
                    </Text>
                    <View style={{
                        backgroundColor: cfg.badge, borderRadius: 10,
                        paddingHorizontal: 10, paddingVertical: 4
                    }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.accentColor }}>
                            {foodItems.length} món
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color={cfg.accentColor} />
                        <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 14 }}>Đang tải món ăn...</Text>
                    </View>
                ) : foodItems.length === 0 ? (
                    <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: cfg.badge, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <MaterialCommunityIcons name="food-off-outline" size={40} color={cfg.accentColor} />
                        </View>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: '#64748B', marginBottom: 6 }}>Chưa có món ăn nào</Text>
                        <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 }}>
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
                    style={{
                        marginTop: 8, paddingVertical: 16,
                        borderRadius: 18, borderWidth: 2,
                        borderColor: cfg.accentColor,
                        borderStyle: 'dashed',
                        flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                        backgroundColor: `${cfg.badge}30`
                    }}
                >
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: cfg.accentColor, alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="plus" size={16} color="#fff" />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: cfg.accentColor }}>
                        Thêm món ăn vào {cfg.label}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
