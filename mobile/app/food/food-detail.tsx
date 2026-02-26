import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Alert,
    TextInput, Image, ActivityIndicator, Modal, Platform, StatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { foodService, Food } from '../../services/foodService';
import { userService } from '../../services/userService';
import Animated, { FadeInDown } from 'react-native-reanimated';

// --- HELPERS ---
const resolveImg = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Bữa Sáng', icon: 'food-croissant', color: '#F97316', gradColors: ['#F97316', '#FB923C'] as [string, string] },
    { id: 'lunch', label: 'Bữa Trưa', icon: 'silverware-fork-knife', color: '#3B82F6', gradColors: ['#3B82F6', '#60A5FA'] as [string, string] },
    { id: 'dinner', label: 'Bữa Tối', icon: 'pot-steam-outline', color: '#8B5CF6', gradColors: ['#8B5CF6', '#A78BFA'] as [string, string] },
    { id: 'snack', label: 'Bữa Phụ', icon: 'food-apple-outline', color: '#F43F5E', gradColors: ['#F43F5E', '#FB7185'] as [string, string] },
];

// --- MÃ MACRO BAR ---
const MacroBar = ({ label, value, total, color, barClassName }: any) => {
    const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
    return (
        <View className="mb-4">
            <View className="flex-row justify-between mb-1.5">
                <Text className="text-slate-500 text-sm font-semibold">{label}</Text>
                <Text className="text-sm font-bold" style={{ color }}>{value}g <Text className="text-slate-400 font-medium">({pct}%)</Text></Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full">
                <View className={`h-full rounded-full ${barClassName}`} style={{ width: `${pct}%` }} />
            </View>
        </View>
    );
};

// --- MAIN ---
export default function FoodDetailScreen() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [food, setFood] = useState<Food | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMicros, setShowMicros] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [amount, setAmount] = useState('1');
    const [selectedMeal, setSelectedMeal] = useState<string>((params.mealType as string) || 'breakfast');
    const [userAllergies, setUserAllergies] = useState<string[]>([]);

    useEffect(() => {
        userService.getProfile().then(u => {
            const alg = u.UserProfile?.allergies;
            if (alg) setUserAllergies(Array.isArray(alg) ? alg : String(alg).split(',').map((s: string) => s.trim()));
        }).catch(() => { });
    }, []);

    useEffect(() => {
        if (params.id) loadData(params.id as string);
    }, [params.id]);

    const loadData = async (id: string) => {
        try {
            setLoading(true);
            const data = await foodService.getById(id);
            setFood(data);
            setIsFavorite(data.is_favorite ?? false);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải thông tin món ăn');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!food) return;
        try { await foodService.toggleFavorite(food.id); setIsFavorite(f => !f); } catch { }
    };

    const addToDiaryLogic = async () => {
        if (!food) return;
        try {
            await foodService.addToDiary({
                food_id: food.id, meal_type: selectedMeal,
                quantity: parseFloat(amount), unit_name: food.serving_unit || 'suất',
                date: selectedDate.toISOString().split('T')[0],
            });
            setShowAddModal(false);
            Alert.alert('Thêm thành công', `Đã thêm ${food.name} vào nhật ký.`, [
                { text: 'Xem Lịch Biểu', onPress: () => router.navigate('/(tabs)/calendar') },
                { text: 'Tiếp tục', style: 'cancel' },
            ]);
        } catch { Alert.alert('Lỗi', 'Không thể thêm vào nhật ký'); }
    };

    const handleAddToDiary = async () => {
        if (!food) return;
        if (userAllergies.length > 0 && food.ingredients?.length) {
            const conflicts = food.ingredients.filter(ing =>
                userAllergies.some(alg => alg.toLowerCase() === ing.name.toLowerCase())
            );
            if (conflicts.length > 0) {
                Alert.alert(
                    'Cảnh báo Dị ứng',
                    `Món ăn này có chứa: ${conflicts.map(c => c.name).join(', ')}\nNằm trong danh sách kiêng kỵ của bạn.`,
                    [{ text: 'Hủy', style: 'cancel' }, { text: 'Vẫn thêm', style: 'destructive', onPress: addToDiaryLogic }]
                );
                return;
            }
        }
        addToDiaryLogic();
    };

    if (loading || !food) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-3 text-slate-400 font-medium">Đang tải...</Text>
            </View>
        );
    }

    const mult = parseFloat(amount || '1') || 1;
    const dispCal = Math.round(food.calories * mult);
    const dispProt = Math.round(food.protein * mult);
    const dispCarb = Math.round(food.carb * mult);
    const dispFat = Math.round(food.fat * mult);
    const totalM = dispProt + dispCarb + dispFat;
    const imgUri = resolveImg(food.image as string | undefined);
    const activeMeal = MEAL_TYPES.find(m => m.id === selectedMeal) || MEAL_TYPES[0];

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Hero Image */}
            <View className="h-72 relative">
                {imgUri ? (
                    <Image source={{ uri: imgUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <LinearGradient colors={['#ECFDF5', '#D1FAE5']} className="flex-1 items-center justify-center">
                        <MaterialCommunityIcons name="food-variant" size={80} color="#6EE7B7" />
                    </LinearGradient>
                )}
                {/* Scrim gradient */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.3)']}
                    locations={[0, 0.4, 1]}
                    className="absolute inset-0"
                />
                {/* Nav buttons */}
                <View className="absolute left-4 right-4 flex-row justify-between" style={{ top: insets.top + 8 }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-xl items-center justify-center bg-black/35"
                    >
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleToggleFavorite}
                        className="w-10 h-10 rounded-xl items-center justify-center bg-black/35"
                    >
                        <Feather name="heart" size={20} color={isFavorite ? '#F43F5E' : '#fff'} />
                    </TouchableOpacity>
                </View>
                {/* Calo badge */}
                <View className="absolute bottom-4 right-4 bg-white/95 rounded-2xl px-3 py-2 flex-row items-center gap-1.5 shadow-sm shadow-black/20">
                    <MaterialCommunityIcons name="fire" size={18} color="#F97316" />
                    <Text className="text-lg font-black text-orange-500">{dispCal}</Text>
                    <Text className="text-xs font-semibold text-slate-400">kcal</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-5"
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-slate-50 rounded-t-[24px] pt-6 px-5">

                    {/* Name + Stepper */}
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 mr-4">
                            <Text className="text-2xl font-black text-slate-900 leading-8">{food.name}</Text>
                            <Text className="text-sm text-slate-400 font-medium mt-1">1 {food.serving_unit || 'suất'}</Text>
                        </View>
                        {/* Amount Stepper */}
                        <View className="flex-row items-center bg-white rounded-2xl border-[1.5px] border-slate-200 overflow-hidden">
                            <TouchableOpacity
                                onPress={() => setAmount((Math.max(0.5, parseFloat(amount) - 0.5)).toString())}
                                className="w-10 h-11 items-center justify-center bg-slate-50"
                            >
                                <Feather name="minus" size={16} color="#64748B" />
                            </TouchableOpacity>
                            <View className="px-3 items-center">
                                <TextInput
                                    value={amount} onChangeText={setAmount} keyboardType="numeric"
                                    className="text-lg font-black text-slate-800 text-center min-w-[28px]"
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => setAmount((parseFloat(amount) + 0.5).toString())}
                                className="w-10 h-11 items-center justify-center bg-emerald-50"
                            >
                                <Feather name="plus" size={16} color="#10B981" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* NUTRITION CARD */}
                    <View className="bg-white rounded-[22px] p-5 border border-slate-100 mb-4 shadow-sm shadow-slate-200">
                        <Text className="text-xs font-bold text-slate-400 tracking-widest mb-4">BẢNG DINH DƯỠNG</Text>

                        {/* 3 Pills */}
                        <View className="flex-row gap-3 mb-5">
                            <View className="flex-1 bg-blue-50 rounded-2xl p-3 items-center border border-blue-100">
                                <Text className="text-2xl font-black text-blue-600">{dispProt}</Text>
                                <Text className="text-[11px] font-semibold text-blue-400">g</Text>
                                <Text className="text-xs font-semibold text-slate-400 mt-1">Protein</Text>
                            </View>
                            <View className="flex-1 bg-amber-50 rounded-2xl p-3 items-center border border-amber-100">
                                <Text className="text-2xl font-black text-amber-500">{dispCarb}</Text>
                                <Text className="text-[11px] font-semibold text-amber-400">g</Text>
                                <Text className="text-xs font-semibold text-slate-400 mt-1">Carbs</Text>
                            </View>
                            <View className="flex-1 bg-rose-50 rounded-2xl p-3 items-center border border-rose-100">
                                <Text className="text-2xl font-black text-rose-500">{dispFat}</Text>
                                <Text className="text-[11px] font-semibold text-rose-400">g</Text>
                                <Text className="text-xs font-semibold text-slate-400 mt-1">Fat</Text>
                            </View>
                        </View>

                        {/* Progress Bars */}
                        <MacroBar label="Protein" value={dispProt} total={totalM} color="#3B82F6" barClassName="bg-blue-500" />
                        <MacroBar label="Carbohydrate" value={dispCarb} total={totalM} color="#F59E0B" barClassName="bg-amber-400" />
                        <MacroBar label="Fat" value={dispFat} total={totalM} color="#F43F5E" barClassName="bg-rose-500" />
                    </View>

                    {/* Micronutrients */}
                    {food.micronutrients && Object.keys(food.micronutrients).length > 0 && (
                        <View className="bg-white rounded-[22px] border border-slate-100 mb-4 overflow-hidden">
                            <TouchableOpacity
                                onPress={() => setShowMicros(!showMicros)}
                                className="flex-row items-center p-4 gap-3"
                            >
                                <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center">
                                    <MaterialCommunityIcons name="flask-outline" size={20} color="#10B981" />
                                </View>
                                <Text className="flex-1 text-base font-bold text-slate-800">Vi chất dinh dưỡng</Text>
                                <Feather name={showMicros ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                            </TouchableOpacity>
                            {showMicros && (
                                <View className="px-4 pb-3">
                                    {Object.entries(food.micronutrients).map(([key, value], idx, arr) => (
                                        <View key={key} className={`flex-row justify-between py-2.5 ${idx < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                            <Text className="text-sm text-slate-500 font-medium capitalize">
                                                {key === 'fiber' ? 'Chất xơ' : key === 'sugar' ? 'Đường' : key === 'sodium' ? 'Natri' : key === 'cholesterol' ? 'Cholesterol' : key}
                                            </Text>
                                            <Text className="text-sm font-bold text-slate-800">
                                                {Math.round((value as number) * mult * 10) / 10}
                                                {['sodium', 'cholesterol', 'potassium', 'calcium'].includes(key) ? 'mg' : 'g'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Ingredients */}
                    {food.ingredients && food.ingredients.length > 0 && (
                        <View className="bg-white rounded-[22px] p-5 border border-slate-100 mb-4">
                            <Text className="text-base font-bold text-slate-800 mb-3">Nguyên liệu ({food.ingredients.length})</Text>
                            {food.ingredients.map((ing, idx) => {
                                const ingImg = resolveImg(ing.image as string | undefined);
                                return (
                                    <View key={idx} className={`flex-row items-center py-2.5 ${idx < food.ingredients!.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                        <View className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 mr-3">
                                            {ingImg
                                                ? <Image source={{ uri: ingImg }} className="w-full h-full" resizeMode="cover" />
                                                : <View className="flex-1 items-center justify-center"><MaterialCommunityIcons name="food-variant" size={22} color="#CBD5E1" /></View>
                                            }
                                        </View>
                                        <Text className="flex-1 text-sm font-semibold text-slate-700">{ing.name}</Text>
                                        {ing.FoodIngredient?.amount_in_grams && (
                                            <View className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                <Text className="text-sm font-bold text-emerald-600">
                                                    {Math.round(ing.FoodIngredient.amount_in_grams * mult)}g
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Description */}
                    {(food.cooking || food.description) && (
                        <View className="bg-white rounded-[22px] p-5 border border-slate-100 mb-4">
                            <Text className="text-base font-bold text-slate-800 mb-3">Mô tả & Cách làm</Text>
                            <Text className="text-[15px] text-slate-600 leading-6">{food.cooking || food.description}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View className="absolute bottom-0 left-0 right-0 px-5 bg-white border-t border-slate-100" style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}>
                <TouchableOpacity onPress={() => setShowAddModal(true)} className="rounded-2xl overflow-hidden">
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        className="flex-row items-center justify-center py-4 gap-2.5"
                    >
                        <MaterialCommunityIcons name="plus-circle-outline" size={22} color="#fff" />
                        <Text className="text-base font-black text-white">Thêm vào Nhật ký</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* ==== MODAL THÊM NHẬT KÝ ==== */}
            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-slate-50 rounded-t-[32px]" style={{ maxHeight: '84%' }}>
                        {/* Handle */}
                        <View className="items-center pt-3 mb-1">
                            <View className="w-10 h-1 rounded-full bg-slate-200" />
                        </View>

                        {/* Modal Header */}
                        <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                            <View>
                                <Text className="text-lg font-black text-slate-900">Thêm vào Nhật ký</Text>
                                <Text className="text-xs text-slate-400 mt-0.5">{food.name}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center"
                            >
                                <Feather name="x" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                            {/* Chọn bữa ăn */}
                            <Text className="text-xs font-bold text-slate-400 tracking-widest mb-3">CHỌN BỮA ĂN</Text>
                            <View className="flex-row flex-wrap gap-2.5 mb-6">
                                {MEAL_TYPES.map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        onPress={() => setSelectedMeal(m.id)}
                                        className={`flex-row items-center gap-2 py-2.5 px-4 rounded-2xl border-[1.5px] ${selectedMeal === m.id ? 'border-transparent' : 'bg-white border-slate-200'}`}
                                        style={selectedMeal === m.id ? { backgroundColor: m.color, borderColor: m.color } : {}}
                                    >
                                        <MaterialCommunityIcons name={m.icon as any} size={16} color={selectedMeal === m.id ? '#fff' : m.color} />
                                        <Text className={`text-sm font-bold ${selectedMeal === m.id ? 'text-white' : 'text-slate-600'}`}>{m.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Chọn ngày */}
                            <Text className="text-xs font-bold text-slate-400 tracking-widest mb-3">CHỌN NGÀY</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="flex-row items-center gap-3 bg-white rounded-2xl p-4 border-[1.5px] border-slate-200 mb-5"
                            >
                                <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center">
                                    <Feather name="calendar" size={16} color="#10B981" />
                                </View>
                                <Text className="flex-1 text-base font-bold text-slate-800">
                                    {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Text>
                                <Feather name="chevron-right" size={16} color="#94A3B8" />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <View className="mb-5">
                                    <DateTimePicker
                                        value={selectedDate} mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(_, date) => {
                                            if (Platform.OS === 'android') setShowDatePicker(false);
                                            if (date) setSelectedDate(date);
                                        }}
                                        textColor="black"
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)} className="items-center py-2.5 bg-emerald-50 rounded-xl mt-2">
                                            <Text className="text-emerald-600 font-bold">Xong</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Số lượng */}
                            <Text className="text-xs font-bold text-slate-400 tracking-widest mb-3">SỐ LƯỢNG</Text>
                            <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 border-[1.5px] border-slate-200 mb-5">
                                <TouchableOpacity
                                    onPress={() => setAmount((Math.max(0.5, parseFloat(amount) - 0.5)).toString())}
                                    className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center"
                                >
                                    <Feather name="minus" size={18} color="#64748B" />
                                </TouchableOpacity>
                                <View className="items-center">
                                    <TextInput
                                        value={amount} onChangeText={setAmount} keyboardType="numeric"
                                        className="text-3xl font-black text-slate-800 text-center min-w-[64px]"
                                    />
                                    <Text className="text-sm text-slate-400 font-semibold">{food.serving_unit || 'suất'}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setAmount((parseFloat(amount) + 0.5).toString())}
                                    className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center"
                                >
                                    <Feather name="plus" size={18} color="#10B981" />
                                </TouchableOpacity>
                            </View>

                            {/* Dark preview card */}
                            <View className="bg-slate-900 rounded-2xl p-4 flex-row items-center justify-between mb-5">
                                <View>
                                    <Text className="text-slate-400 text-xs font-semibold">Năng lượng</Text>
                                    <View className="flex-row items-baseline gap-1.5 mt-1">
                                        <Text className="text-emerald-400 text-3xl font-black">{dispCal}</Text>
                                        <Text className="text-emerald-300 text-sm font-bold">kcal</Text>
                                    </View>
                                </View>
                                <View className="gap-1.5">
                                    <Text className="text-amber-300 text-xs font-bold">C: {dispCarb}g</Text>
                                    <Text className="text-blue-300 text-xs font-bold">P: {dispProt}g</Text>
                                    <Text className="text-pink-300 text-xs font-bold">F: {dispFat}g</Text>
                                </View>
                            </View>

                            {/* Confirm button */}
                            <TouchableOpacity onPress={handleAddToDiary} className="rounded-2xl overflow-hidden">
                                <LinearGradient
                                    colors={activeMeal.gradColors}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    className="flex-row items-center justify-center py-4 gap-2.5"
                                >
                                    <Feather name="check-circle" size={20} color="#fff" />
                                    <Text className="text-base font-black text-white">Lưu vào {activeMeal.label}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <View className="h-6" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
