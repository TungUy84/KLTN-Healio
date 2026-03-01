import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Alert, FlatList,
    TextInput, Image, ActivityIndicator, Modal, Platform, StatusBar, Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Beef, Wheat, Droplet, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { foodService, Food } from '../../services/foodService';
import { userService } from '../../services/userService';

const { width } = Dimensions.get('window');

// --- HELPERS ---
const resolveImg = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Sáng', icon: 'weather-sunset-up', color: '#3B82F6' },
    { id: 'lunch', label: 'Trưa', icon: 'white-balance-sunny', color: '#F59E0B' },
    { id: 'dinner', label: 'Tối', icon: 'weather-night', color: '#8B5CF6' },
    { id: 'snack', label: 'Phụ', icon: 'cookie', color: '#10B981' },
];

// --- MÃ MACRO BAR ---
const MacroBar = ({ label, IconComponent, value, total, color, barClassName }: any) => {
    const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconComponent size={11} color={color} />
                    <Text className="text-slate-500 text-xs font-semibold">{label}</Text>
                </View>
                <Text className="text-slate-700 font-black text-xs">
                    {value}g
                </Text>
            </View>
            <View className="bg-slate-100 rounded-full overflow-hidden" style={{ height: 6 }}>
                <View className={`h-full rounded-full ${barClassName}`} style={{ width: `${pct}%`, backgroundColor: color }} />
            </View>
        </View>
    );
};

// --- BACKGROUND AMBIENT GLOW ---
const AmbientGlowBackground = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <Svg height="100%" width="100%">
            <Defs>
                <SvgRadialGradient id="grad1" cx="0%" cy="0%" rx="60%" ry="60%" fx="0%" fy="0%">
                    <Stop offset="0%" stopColor="#EA580C" stopOpacity="0.18" />
                    <Stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                </SvgRadialGradient>
                <SvgRadialGradient id="grad2" cx="100%" cy="25%" rx="50%" ry="50%" fx="100%" fy="25%">
                    <Stop offset="0%" stopColor="#FB923C" stopOpacity="0.12" />
                    <Stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
                </SvgRadialGradient>
                <SvgRadialGradient id="grad3" cx="0%" cy="60%" rx="50%" ry="50%" fx="0%" fy="60%">
                    <Stop offset="0%" stopColor="#F97316" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
        </Svg>
        {/* Gradient Fade To White */}
        <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,1)', 'rgba(255,255,255,1)']}
            locations={[0, 0.45, 0.6, 1]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
    </View>
);

// --- MAIN ---
export default function FoodDetailScreen() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [food, setFood] = useState<Food | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMicros, setShowMicros] = useState(false);

    // Form States
    const getCurrentMealType = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'breakfast';
        if (hour >= 11 && hour < 14) return 'lunch';
        if (hour >= 14 && hour < 18) return 'snack';
        if (hour >= 18 && hour < 23) return 'dinner';
        return 'snack'; // Late night
    };

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [amount, setAmount] = useState('1');
    const [selectedMeal, setSelectedMeal] = useState<string>((params.mealType as string) || getCurrentMealType());
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
        try {
            await foodService.toggleFavorite(food.id);
            setIsFavorite(f => !f);
        } catch { }
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
            Alert.alert('Thêm thành công', `Đã ghi nhận ${amount} ${food.serving_unit || 'suất'} ${food.name} vào nhật ký.`);
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
                <AmbientGlowBackground />
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="mt-3 text-slate-500 font-medium">Đang tải...</Text>
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

    const PLATE_SIZE = width * 0.65;

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />

            {/* HEADER NAVIGATION */}
            <View className="z-50 px-5 flex-row justify-between items-center" style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200">
                    <Feather name="chevron-left" size={24} color="#F97316" />
                </TouchableOpacity>

                <Animated.Text entering={FadeInDown.delay(100).springify()} className="text-[17px] font-bold text-slate-800 tracking-wide">
                    Chi tiết
                </Animated.Text>

                <TouchableOpacity onPress={handleToggleFavorite} className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200">
                    <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="#F43F5E" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. FLOATING FOOD PLATE */}
                <View className="items-center mt-4 mb-8">
                    <Animated.View
                        entering={ZoomIn.duration(600).springify()}
                        className="rounded-full bg-slate-100"
                        style={{
                            width: PLATE_SIZE, height: PLATE_SIZE,
                            shadowColor: '#334155', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.25, shadowRadius: 24,
                            elevation: 10
                        }}
                    >
                        {imgUri ? (
                            <Image source={{ uri: imgUri }} className="w-full h-full rounded-full" />
                        ) : (
                            <View className="flex-1 items-center justify-center bg-orange-50 rounded-full border-[6px] border-white focus:outline-none">
                                <MaterialCommunityIcons name="food-variant" size={60} color="#FDBA74" />
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* 2. TITLE & CALORIES BADGE */}
                <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mb-6 flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <Text className="text-[28px] font-black text-slate-900 leading-[34px] tracking-tight">{food.name}</Text>
                        <Text className="text-[15px] font-semibold text-slate-500 mt-2">1 {food.serving_unit || 'suất'}</Text>
                        <Text className="text-[14px] font-medium text-slate-400 mt-1.5 leading-5 items-center">
                            {food.description || food.cooking || 'Món ăn ngon và đủ dưỡng chất, thích hợp cho kế hoạch ăn uống của bạn.'}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, paddingVertical: 6, borderRadius: 20 }}>
                        <Flame size={20} color="#F97316" />
                        <Text style={{ color: '#F97316', fontWeight: '900', fontSize: 22 }}>
                            {Math.round(food.calories)} <Text style={{ fontSize: 13, fontWeight: '700' }}>kcal</Text>
                        </Text>
                    </View>
                </Animated.View>

                {/* 3. NUTRITION MACROS (KHÔNG KHUNG BỌC) */}
                <Animated.View entering={FadeInDown.delay(250).springify()} className="px-6 mb-8 mt-2" style={{ gap: 12 }}>
                    {/* Progress Bars */}
                    <MacroBar label="Đạm" IconComponent={Beef} value={dispProt} total={totalM} color="#3B82F6" barClassName="bg-blue-400" />
                    <MacroBar label="Tinh bột" IconComponent={Wheat} value={dispCarb} total={totalM} color="#10B981" barClassName="bg-emerald-400" />
                    <MacroBar label="Chất béo" IconComponent={Droplet} value={dispFat} total={totalM} color="#EAB308" barClassName="bg-yellow-400" />
                </Animated.View>

                {/* 4. HORIZONTAL INGREDIENTS LIST */}
                {food.ingredients && food.ingredients.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(280).springify()} className="mb-8">
                        <Text className="text-[18px] font-bold text-slate-800 px-6 mb-4">Nguyên liệu</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                            data={food.ingredients}
                            keyExtractor={(item, index) => `${item.id}_${index}`}
                            renderItem={({ item, index }) => (
                                <View className="items-center mr-3 bg-white w-[88px] pb-4 pt-3 rounded-[24px] border border-slate-100" style={{ shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                                    <View className="w-14 h-14 rounded-full bg-slate-50 mb-3" style={{ shadowColor: '#475569', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8 }}>
                                        {resolveImg(item.image) ? (
                                            <Image source={{ uri: resolveImg(item.image) as string }} className="w-full h-full rounded-full" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center bg-orange-50 rounded-full">
                                                <MaterialCommunityIcons name="food-apple" size={24} color="#FDBA74" />
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-[13px] font-bold text-slate-700 text-center px-2" numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    {item.FoodIngredient?.amount_in_grams && (
                                        <Text className="text-[11px] font-semibold text-slate-400 mt-1">{item.FoodIngredient.amount_in_grams}g</Text>
                                    )}
                                </View>
                            )}
                        />
                    </Animated.View>
                )}

                {/* 5. MEAL AND DIET INFO */}
                <Animated.View entering={FadeInDown.delay(290).springify()} className="px-6 mb-8 mt-2">
                    {food.meal_categories && food.meal_categories.length > 0 ? (
                        <Text className="text-[14px] text-slate-500 mb-1.5 font-medium">
                            Phù hợp với: <Text className="font-bold text-slate-700">
                                {food.meal_categories.map(m => {
                                    if (m.toLowerCase() === 'breakfast') return 'bữa sáng';
                                    if (m.toLowerCase() === 'lunch') return 'bữa trưa';
                                    if (m.toLowerCase() === 'dinner') return 'bữa tối';
                                    if (m.toLowerCase() === 'snack') return 'ăn vặt';
                                    return m;
                                }).join(', ')}
                            </Text>
                        </Text>
                    ) : (
                        <Text className="text-[14px] text-slate-500 mb-1.5 font-medium">
                            Phù hợp với: <Text className="font-bold text-slate-700">Mọi bữa ăn</Text>
                        </Text>
                    )}

                    <Text className="text-[14px] text-slate-500 font-medium">
                        Chế độ ăn phù hợp: <Text className="font-bold text-slate-700">
                            {food.dietPresets && food.dietPresets.length > 0 ? food.dietPresets.map(d => d.name).join(', ') : 'Cân bằng'}
                        </Text>
                    </Text>
                </Animated.View>

                {/* 6. MICRONUTRIENTS CHIPS (COLLAPSIBLE) */}
                {food.micronutrients && Object.keys(food.micronutrients).length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="px-6 mb-8">
                        <Text className="text-[17px] font-bold text-slate-800 mb-4 tracking-tight">Vi chất dinh dưỡng</Text>
                        <View className="flex-row flex-wrap gap-2.5 items-center">
                            {(showMicros ? Object.entries(food.micronutrients) : Object.entries(food.micronutrients).slice(0, 3)).map(([key, value]) => {
                                const map: any = {
                                    fiber: { n: 'Chất xơ', i: 'leaf', c: '#10B981' },
                                    sugar: { n: 'Đường', i: 'cube-outline', c: '#F43F5E' },
                                    sodium: { n: 'Natri', i: 'shaker-outline', c: '#64748B' },
                                    cholesterol: { n: 'Cholest.', i: 'heart-pulse', c: '#F43F5E' },
                                    potassium: { n: 'Kali', i: 'lightning-bolt', c: '#EAB308' },
                                    calcium: { n: 'Canxi', i: 'bone', c: '#94A3B8' },
                                    iron: { n: 'Sắt', i: 'weight', c: '#475569' },
                                    vitamin_a: { n: 'Vit A', i: 'eye-outline', c: '#F97316' },
                                    vit_a: { n: 'Vit A', i: 'eye-outline', c: '#F97316' },
                                    vitamin_c: { n: 'Vit C', i: 'fruit-citrus', c: '#F59E0B' },
                                    vit_c: { n: 'Vit C', i: 'fruit-citrus', c: '#F59E0B' },
                                    vitamin_d: { n: 'Vit D', i: 'white-balance-sunny', c: '#FBBF24' },
                                    vit_d: { n: 'Vit D', i: 'white-balance-sunny', c: '#FBBF24' },
                                };
                                const cleanKey = key.toLowerCase().replace(/_mg$|_g$|_mcg$|_iu$/, '');
                                const meta = map[cleanKey] || { n: key.replace(/_MG|_G|_IU/i, ''), i: 'water-outline', c: '#3B82F6' };
                                const unit = ['sodium', 'cholesterol', 'potassium', 'calcium'].includes(cleanKey) || key.toLowerCase().includes('_mg') ? 'mg' : 'g';
                                const val = Math.round((value as number) * mult * 10) / 10;

                                return (
                                    <View key={key} className="flex-row items-center bg-white/70 border border-white rounded-[18px] pl-2 pr-3 py-2 shadow-sm shadow-slate-200/50">
                                        <View className="w-7 h-7 rounded-full bg-white items-center justify-center mr-2 shadow-sm shadow-slate-100">
                                            <MaterialCommunityIcons name={meta.i} size={14} color={meta.c} />
                                        </View>
                                        <View>
                                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{meta.n}</Text>
                                            <View className="flex-row items-baseline gap-0.5">
                                                <Text className="text-[13px] font-black text-slate-700">{val}</Text>
                                                <Text className="text-[10px] font-bold text-slate-500">{unit}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}

                            {/* Toggle Button */}
                            {Object.keys(food.micronutrients).length > 3 && (
                                <TouchableOpacity
                                    onPress={() => setShowMicros(!showMicros)}
                                    className="w-10 h-10 rounded-full bg-slate-100/80 items-center justify-center border border-white shadow-sm shadow-slate-200/50"
                                >
                                    <Feather name={showMicros ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                )}

            </ScrollView>

            {/* 4. BOTTOM ADD TO ORDER BAR */}
            <BlurView
                tint="light"
                intensity={95}
                className="absolute bottom-0 left-0 right-0 pt-4 px-5 flex-row items-center border-t border-slate-200/50"
                style={{ paddingBottom: (insets.bottom || 16) + 8, backgroundColor: 'rgba(255,255,255,0.85)' }}
            >
                {/* Stepper */}
                <View className="flex-row items-center bg-white rounded-full border border-slate-100 px-2 h-[52px] shadow-sm shadow-slate-200 mr-4">
                    <TouchableOpacity
                        onPress={() => setAmount((Math.max(0.5, parseFloat(amount) - 0.5)).toString())}
                        className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-50"
                    >
                        <Feather name="minus" size={18} color="#F97316" />
                    </TouchableOpacity>

                    <TextInput
                        value={amount} onChangeText={setAmount} keyboardType="numeric"
                        className="text-[17px] font-bold text-slate-800 text-center min-w-[32px] mx-1"
                    />

                    <TouchableOpacity
                        onPress={() => setAmount((parseFloat(amount) + 0.5).toString())}
                        className="w-10 h-10 items-center justify-center rounded-full active:bg-orange-50"
                    >
                        <Feather name="plus" size={18} color="#F97316" />
                    </TouchableOpacity>
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    className="flex-1 h-[52px]"
                    style={{ shadowColor: '#EA580C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#FB923C', '#EA580C']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 999 }}
                    >
                        <Text className="text-[16px] font-bold text-white tracking-wide">Thêm món ăn</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>

            {/* ==== DIARY MODAL (GIỮ LẠI LOGIC CHỈ CẢI TIẾN NHẸ UI) ==== */}
            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-[32px]" style={{ maxHeight: '84%' }}>
                        <View className="items-center pt-3 mb-1"><View className="w-10 h-1 rounded-full bg-slate-200" /></View>

                        <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
                            <View>
                                <Text className="text-[19px] font-black text-slate-900">Thêm vào Nhật ký</Text>
                                <Text className="text-[13px] text-slate-500 mt-1 font-medium">{food.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowAddModal(false)} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center">
                                <Feather name="x" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
                            <Text className="text-[12px] font-black text-slate-400 tracking-widest mb-3">CHỌN BỮA ĂN</Text>
                            <View className="flex-row justify-between items-center mb-6">
                                {MEAL_TYPES.map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        onPress={() => setSelectedMeal(m.id)}
                                        className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 mx-1 rounded-2xl border-[1.5px] ${selectedMeal === m.id ? 'border-transparent' : 'bg-white border-slate-200'}`}
                                        style={selectedMeal === m.id ? { backgroundColor: m.color, borderColor: m.color } : {}}
                                    >
                                        <MaterialCommunityIcons name={m.icon as any} size={16} color={selectedMeal === m.id ? '#fff' : m.color} />
                                        <Text className={`text-[13px] font-bold ${selectedMeal === m.id ? 'text-white' : 'text-slate-600'}`}>{m.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-[12px] font-black text-slate-400 tracking-widest mb-3">CHỌN NGÀY</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center gap-3 bg-white rounded-2xl p-4 border-[1.5px] border-slate-200 mb-6">
                                <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                                    <Feather name="calendar" size={18} color="#F97316" />
                                </View>
                                <Text className="flex-1 text-[16px] font-bold text-slate-800">
                                    {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Text>
                                <Feather name="chevron-right" size={18} color="#94A3B8" />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <View className="mb-6 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                                    <DateTimePicker
                                        value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        themeVariant="light"
                                        onChange={(_, date) => { if (Platform.OS === 'android') setShowDatePicker(false); if (date) setSelectedDate(date); }}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)} className="items-center py-3 bg-white rounded-xl mt-2 border border-slate-200 shadow-sm shadow-slate-100">
                                            <Text className="text-slate-800 font-black">Xác nhận ngày</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <Text className="text-[12px] font-black text-slate-400 tracking-widest mb-3">TỔNG NĂNG LƯỢNG</Text>
                            <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 border-[1.5px] border-slate-200 mb-6">
                                <View className="flex-row items-baseline gap-1.5">
                                    <Text className="text-slate-800 text-[20px] font-black">{amount}</Text>
                                    <Text className="text-slate-500 text-[15px] font-bold">{food.serving_unit || 'suất'}</Text>
                                </View>

                                <View className="flex-row items-baseline gap-1.5">
                                    <Text className="text-orange-500 text-[24px] font-black">{dispCal}</Text>
                                    <Text className="text-orange-400 text-[15px] font-bold">kcal</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleAddToDiary} className="h-[52px]" style={{ shadowColor: '#EA580C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 }} activeOpacity={0.8}>
                                <LinearGradient colors={['#FB923C', '#EA580C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 999 }}>
                                    <Text className="text-[16px] font-bold text-white tracking-wide">Xác nhận Thêm</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <View className="h-4" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View >
    );
}
