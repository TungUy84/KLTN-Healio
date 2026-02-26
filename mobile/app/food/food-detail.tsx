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

// --- HELPERS ---
const resolveImg = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Bữa Sáng', icon: 'coffee', color: '#F97316', bg: '#FFF7ED', badge: '#FED7AA' },
    { id: 'lunch', label: 'Bữa Trưa', icon: 'silverware-fork-knife', color: '#3B82F6', bg: '#EFF6FF', badge: '#BFDBFE' },
    { id: 'dinner', label: 'Bữa Tối', icon: 'pot-steam-outline', color: '#8B5CF6', bg: '#F5F3FF', badge: '#DDD6FE' },
    { id: 'snack', label: 'Bữa Phụ', icon: 'food-apple-outline', color: '#F43F5E', bg: '#FFF1F2', badge: '#FECDD3' },
];

// --- MACRO BAR ---
const MacroBar = ({ label, value, total, color, bg }: any) => {
    const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
    return (
        <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569' }}>{label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color }}>{value}g</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 }}>
                <View style={{ height: '100%', width: `${pct}%`, borderRadius: 4, backgroundColor: color }} />
            </View>
        </View>
    );
};

// --- MICRO ROW ---
const MicroRow = ({ label, value, unit }: any) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
        <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{value} {unit || 'g'}</Text>
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

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [amount, setAmount] = useState('1');
    const [selectedMeal, setSelectedMeal] = useState<string>((params.mealType as string) || 'breakfast');
    const [userAllergies, setUserAllergies] = useState<string[]>([]);

    useEffect(() => {
        userService.getProfile().then(u => {
            const alg = u.UserProfile?.allergies;
            if (alg) {
                setUserAllergies(Array.isArray(alg) ? alg : String(alg).split(',').map((s: string) => s.trim()));
            }
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
            Alert.alert('✅ Thành công!', `Đã thêm ${food.name} vào nhật ký.`, [
                { text: 'Xem Lịch Biểu', onPress: () => router.navigate('/(tabs)/calendar') },
                { text: 'Tiếp tục', style: 'cancel' }
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
                    '⚠️ Cảnh báo Dị ứng',
                    `Món ăn này có chứa: ${conflicts.map(c => c.name).join(', ')}\nĐây là nguyên liệu nằm trong danh sách kiêng kỵ của bạn.`,
                    [{ text: 'Hủy', style: 'cancel' }, { text: 'Vẫn thêm', style: 'destructive', onPress: addToDiaryLogic }]
                );
                return;
            }
        }
        addToDiaryLogic();
    };

    if (loading || !food) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={{ marginTop: 12, color: '#94A3B8' }}>Đang tải...</Text>
            </View>
        );
    }

    const mult = parseFloat(amount || '1') || 1;
    const dispCal = Math.round(food.calories * mult);
    const dispProt = Math.round(food.protein * mult);
    const dispCarb = Math.round(food.carb * mult);
    const dispFat = Math.round(food.fat * mult);
    const totalMacros = dispProt + dispCarb + dispFat;
    const imgUri = resolveImg(food.image as string | undefined);
    const activeMeal = MEAL_TYPES.find(m => m.id === selectedMeal) || MEAL_TYPES[0];

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Hero Image */}
            <View style={{ height: 280, position: 'relative' }}>
                {imgUri ? (
                    <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                    <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="food-variant" size={80} color="#6EE7B7" />
                    </LinearGradient>
                )}
                {/* Scrim */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.3)']}
                    locations={[0, 0.4, 1]}
                    style={{ position: 'absolute', inset: 0 } as any}
                />
                {/* Nav buttons */}
                <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleToggleFavorite}
                        style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Feather name="heart" size={20} color={isFavorite ? '#F43F5E' : '#fff'} />
                    </TouchableOpacity>
                </View>
                {/* Calo floating badge */}
                <View style={{
                    position: 'absolute', bottom: 16, right: 16,
                    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16,
                    paddingHorizontal: 14, paddingVertical: 8,
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8,
                }}>
                    <MaterialCommunityIcons name="fire" size={18} color="#F97316" />
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#F97316' }}>{dispCal}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#94A3B8' }}>kcal</Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1, marginTop: -20 }}
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, paddingHorizontal: 20 }}>

                    {/* Name + Amount row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={{ fontSize: 24, fontWeight: '900', color: '#0F172A', lineHeight: 30 }}>
                                {food.name}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#94A3B8', fontWeight: '500', marginTop: 4 }}>
                                1 {food.serving_unit || 'suất'}
                            </Text>
                        </View>
                        {/* Amount Stepper */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden' }}>
                            <TouchableOpacity
                                onPress={() => setAmount((Math.max(0.5, parseFloat(amount) - 0.5)).toString())}
                                style={{ width: 38, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}
                            >
                                <Feather name="minus" size={16} color="#64748B" />
                            </TouchableOpacity>
                            <View style={{ paddingHorizontal: 10, alignItems: 'center' }}>
                                <TextInput
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', textAlign: 'center', minWidth: 28 }}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => setAmount((parseFloat(amount) + 0.5).toString())}
                                style={{ width: 38, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5' }}
                            >
                                <Feather name="plus" size={16} color="#10B981" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Macros Card */}
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 16, shadowColor: '#CBD5E1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 16 }}>
                            BẢNG DINH DƯỠNG
                        </Text>

                        {/* Summary Row */}
                        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 10 }}>
                            {[
                                { label: 'Protein', value: dispProt, color: '#3B82F6', bg: '#EFF6FF' },
                                { label: 'Carbs', value: dispCarb, color: '#F59E0B', bg: '#FFFBEB' },
                                { label: 'Fat', value: dispFat, color: '#F43F5E', bg: '#FFF1F2' },
                            ].map(m => (
                                <View key={m.label} style={{ flex: 1, backgroundColor: m.bg, borderRadius: 14, padding: 12, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 20, fontWeight: '900', color: m.color }}>{m.value}</Text>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: m.color, opacity: 0.7 }}>g</Text>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 4 }}>{m.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Bars */}
                        <MacroBar label="Protein" value={dispProt} total={totalMacros} color="#3B82F6" bg="#EFF6FF" />
                        <MacroBar label="Carbohydrate" value={dispCarb} total={totalMacros} color="#F59E0B" bg="#FFFBEB" />
                        <MacroBar label="Fat" value={dispFat} total={totalMacros} color="#F43F5E" bg="#FFF1F2" />
                    </View>

                    {/* Micronutrients Toggle */}
                    {food.micronutrients && Object.keys(food.micronutrients).length > 0 && (
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 16, overflow: 'hidden' }}>
                            <TouchableOpacity
                                onPress={() => setShowMicros(!showMicros)}
                                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}
                            >
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
                                    <MaterialCommunityIcons name="flask-outline" size={20} color="#10B981" />
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' }}>Vi chất dinh dưỡng</Text>
                                <Feather name={showMicros ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                            </TouchableOpacity>
                            {showMicros && (
                                <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                                    {Object.entries(food.micronutrients).map(([key, value]) => (
                                        <MicroRow
                                            key={key}
                                            label={key === 'fiber' ? 'Chất xơ' : key === 'sugar' ? 'Đường' : key === 'sodium' ? 'Natri' : key === 'cholesterol' ? 'Cholesterol' : key}
                                            value={Math.round((value as number) * mult * 10) / 10}
                                            unit={['sodium', 'cholesterol', 'potassium', 'calcium'].includes(key) ? 'mg' : 'g'}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Ingredients */}
                    {food.ingredients && food.ingredients.length > 0 && (
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 14 }}>
                                Nguyên liệu ({food.ingredients.length})
                            </Text>
                            {food.ingredients.map((ing, idx) => {
                                const ingImg = resolveImg(ing.image as string | undefined);
                                return (
                                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < food.ingredients!.length - 1 ? 1 : 0, borderBottomColor: '#F1F5F9' }}>
                                        <View style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F8FAFC', marginRight: 12 }}>
                                            {ingImg ? (
                                                <Image source={{ uri: ingImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                            ) : (
                                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 20 }}>🥗</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' }}>{ing.name}</Text>
                                        {ing.FoodIngredient?.amount_in_grams && (
                                            <View style={{ backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>
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
                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 }}>Mô tả & Cách làm</Text>
                            <Text style={{ fontSize: 14, color: '#64748B', lineHeight: 24 }}>{food.cooking || food.description}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: insets.bottom + 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    style={{ borderRadius: 18, overflow: 'hidden' }}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 }}
                    >
                        <MaterialCommunityIcons name="plus-circle-outline" size={22} color="#fff" />
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>Thêm vào Nhật ký</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Add to Diary Modal */}
            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '82%' }}>
                        {/* Modal Handle */}
                        <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
                            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' }} />
                        </View>

                        {/* Modal Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A' }}>Thêm vào Nhật ký</Text>
                                <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{food.name}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Feather name="x" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                            {/* Meal Type */}
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10, letterSpacing: 0.5 }}>
                                CHỌN BỮA ĂN
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                                {MEAL_TYPES.map(m => (
                                    <TouchableOpacity
                                        key={m.id}
                                        onPress={() => setSelectedMeal(m.id)}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 8,
                                            paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14,
                                            backgroundColor: selectedMeal === m.id ? m.color : '#FFFFFF',
                                            borderWidth: 1.5,
                                            borderColor: selectedMeal === m.id ? m.color : '#E2E8F0',
                                        }}
                                    >
                                        <MaterialCommunityIcons name={m.icon as any} size={16} color={selectedMeal === m.id ? '#fff' : m.color} />
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: selectedMeal === m.id ? '#fff' : '#64748B' }}>
                                            {m.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Date */}
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10, letterSpacing: 0.5 }}>
                                CHỌN NGÀY
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 20 }}
                            >
                                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                                    <Feather name="calendar" size={16} color="#10B981" />
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
                                    {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Text>
                                <Feather name="chevron-right" size={16} color="#94A3B8" />
                            </TouchableOpacity>

                            {showDatePicker && (
                                <View style={{ marginBottom: 20 }}>
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
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ alignItems: 'center', paddingVertical: 10, backgroundColor: '#ECFDF5', borderRadius: 10, marginTop: 8 }}>
                                            <Text style={{ color: '#10B981', fontWeight: '700' }}>Xong</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Amount */}
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10, letterSpacing: 0.5 }}>
                                SỐ LƯỢNG
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 24 }}>
                                <TouchableOpacity
                                    onPress={() => setAmount((Math.max(0.5, parseFloat(amount) - 0.5)).toString())}
                                    style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Feather name="minus" size={18} color="#64748B" />
                                </TouchableOpacity>
                                <View style={{ alignItems: 'center' }}>
                                    <TextInput
                                        value={amount} onChangeText={setAmount} keyboardType="numeric"
                                        style={{ fontSize: 26, fontWeight: '900', color: '#1E293B', textAlign: 'center', minWidth: 60 }}
                                    />
                                    <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '600' }}>{food.serving_unit || 'suất'}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setAmount((parseFloat(amount) + 0.5).toString())}
                                    style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Feather name="plus" size={18} color="#10B981" />
                                </TouchableOpacity>
                            </View>

                            {/* Preview */}
                            <View style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <View>
                                    <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>Năng lượng</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                                        <Text style={{ color: '#34D399', fontSize: 28, fontWeight: '900' }}>{dispCal}</Text>
                                        <Text style={{ color: '#6EE7B7', fontSize: 14, fontWeight: '700' }}>kcal</Text>
                                    </View>
                                </View>
                                <View style={{ gap: 6 }}>
                                    <Text style={{ color: '#FCD34D', fontSize: 12, fontWeight: '700' }}>C: {dispCarb}g</Text>
                                    <Text style={{ color: '#93C5FD', fontSize: 12, fontWeight: '700' }}>P: {dispProt}g</Text>
                                    <Text style={{ color: '#F9A8D4', fontSize: 12, fontWeight: '700' }}>F: {dispFat}g</Text>
                                </View>
                            </View>

                            {/* Confirm Button */}
                            <TouchableOpacity onPress={handleAddToDiary} style={{ borderRadius: 16, overflow: 'hidden' }}>
                                <LinearGradient
                                    colors={[activeMeal.color, activeMeal.color + 'CC']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 }}
                                >
                                    <Feather name="check-circle" size={20} color="#fff" />
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                                        Lưu vào {activeMeal.label}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
