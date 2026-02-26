import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Image,
    ActivityIndicator, Dimensions, RefreshControl, StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { foodService, Food } from '../../services/foodService';
import { userService } from '../../services/userService';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// --- CẤU HÌNH CATEGORIES ---
const CATEGORIES = [
    { id: 'all', name: 'Gợi ý', icon: 'star', color: '#10B981', bg: '#ECFDF5', type: 'all' },
    { id: 'breakfast', name: 'Sáng', icon: 'sunrise', color: '#F97316', bg: '#FFF7ED', type: 'meal' },
    { id: 'lunch', name: 'Trưa', icon: 'sun', color: '#EAB308', bg: '#FEFCE8', type: 'meal' },
    { id: 'dinner', name: 'Tối', icon: 'moon', color: '#6366F1', bg: '#EEF2FF', type: 'meal' },
    { id: 'snack', name: 'Phụ', icon: 'coffee', color: '#EC4899', bg: '#FDF2F8', type: 'meal' },
    { id: 'high_protein', name: 'Giàu Đạm', icon: 'activity', color: '#EF4444', bg: '#FEF2F2', type: 'sort', param: 'protein' },
    { id: 'low_carb', name: 'Ít Carb', icon: 'zap', color: '#8B5CF6', bg: '#F5F3FF', type: 'tag', param: 'low_carb' },
];

const getMealByTime = () => {
    const h = new Date().getHours();
    if (h >= 4 && h < 11) return 'breakfast';
    if (h >= 11 && h < 14) return 'lunch';
    if (h >= 14 && h < 18) return 'snack';
    return 'dinner';
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return 'Chào buổi sáng sớm ☀️';
    if (h < 11) return 'Chào buổi sáng 🌤️';
    if (h < 14) return 'Giờ ăn trưa rồi 🍱';
    if (h < 18) return 'Chào buổi chiều ☕';
    return 'Chào buổi tối 🌙';
};

const resolveImg = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

// --- CATEGORY TAB ---
const CategoryTab = ({ item, isActive, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            flexDirection: 'row', alignItems: 'center',
            marginRight: 10, paddingVertical: 8, paddingHorizontal: 14,
            borderRadius: 20,
            backgroundColor: isActive ? item.color : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isActive ? item.color : '#E2E8F0',
            shadowColor: isActive ? item.color : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isActive ? 0.3 : 0,
            shadowRadius: 6,
            elevation: isActive ? 3 : 0,
        }}
    >
        <Feather name={item.icon as any} size={14} color={isActive ? '#fff' : item.color} />
        <Text style={{ fontSize: 13, fontWeight: '700', marginLeft: 6, color: isActive ? '#fff' : '#475569' }}>
            {item.name}
        </Text>
    </TouchableOpacity>
);

// --- FOOD CARD (2 cột, dạng card đẹp) ---
const FoodCard = ({ item, index, onPress }: { item: Food, index: number, onPress: () => void }) => {
    const img = resolveImg(item.image as string | undefined);
    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={{ width: CARD_WIDTH, marginBottom: 16 }}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.88}
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    overflow: 'hidden',
                    borderWidth: 1.5,
                    borderColor: '#F1F5F9',
                    shadowColor: '#94A3B8',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 3,
                }}
            >
                {/* Ảnh */}
                <View style={{ height: 130, backgroundColor: '#F8FAFC', position: 'relative' }}>
                    {img ? (
                        <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4' }}>
                            <MaterialCommunityIcons name="food-variant" size={40} color="#A7F3D0" />
                        </View>
                    )}
                    {/* Overlay gradient from bottom */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.45)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
                    />
                    {/* Calo badge */}
                    <View style={{
                        position: 'absolute', bottom: 8, left: 8,
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
                        flexDirection: 'row', alignItems: 'center', gap: 3,
                    }}>
                        <MaterialCommunityIcons name="fire" size={12} color="#F97316" />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#F97316' }}>
                            {Math.round(item.calories)} kcal
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E293B', lineHeight: 20, marginBottom: 8 }} numberOfLines={2}>
                        {item.name}
                    </Text>

                    {/* Macros chips */}
                    <View style={{ flexDirection: 'row', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                        <View style={{ backgroundColor: '#FEF9C3', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#A16207' }}>C {Math.round(item.carb)}g</Text>
                        </View>
                        <View style={{ backgroundColor: '#DBEAFE', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#1D4ED8' }}>P {Math.round(item.protein)}g</Text>
                        </View>
                        <View style={{ backgroundColor: '#FCE7F3', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#9D174D' }}>F {Math.round(item.fat)}g</Text>
                        </View>
                    </View>

                    {/* Bottom row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>
                            1 {item.serving_unit || 'suất'}
                        </Text>
                        <View style={{
                            width: 30, height: 30, borderRadius: 10,
                            backgroundColor: '#ECFDF5',
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: '#A7F3D0',
                        }}>
                            <Feather name="plus" size={16} color="#10B981" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- MAIN SCREEN ---
export default function FoodsScreen() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const [activeCategory, setActiveCategory] = useState<string>(() =>
        params.meal ? params.meal as string : 'all'
    );
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userDietMode, setUserDietMode] = useState<string>('balanced');

    useEffect(() => {
        userService.getProfile().then(user => {
            if (user?.UserNutritionTarget?.DietPreset?.code) {
                setUserDietMode(user.UserNutritionTarget.DietPreset.code);
            }
        }).catch(() => { });
    }, []);

    const fetchFoods = async (isLoadMore = false) => {
        if (loading) return;
        try {
            setLoading(true);
            const filterParams: any = { limit: 20, page: isLoadMore ? page : 1 };
            const category = CATEGORIES.find(c => c.id === activeCategory);

            if (category) {
                if (category.id === 'all') {
                    filterParams.meal_category = getMealByTime();
                    if (userDietMode === 'muscle_gain' || userDietMode === 'high_protein') {
                        filterParams.sort = 'protein'; filterParams.order = 'DESC';
                    } else if (userDietMode === 'weight_loss' || userDietMode === 'low_carb') {
                        filterParams.sort = 'carb'; filterParams.order = 'ASC';
                    } else if (userDietMode === 'keto') {
                        filterParams.diet_tag = 'keto';
                    }
                } else if (category.type === 'meal') {
                    filterParams.meal_category = category.id;
                } else if (category.type === 'sort') {
                    filterParams.sort = category.param; filterParams.order = 'DESC';
                } else if (category.type === 'tag') {
                    filterParams.diet_tag = category.param;
                }
            }

            const res = await foodService.search(filterParams);
            if (isLoadMore) setFoods(prev => [...prev, ...res.data]);
            else setFoods(res.data);
            setHasMore(res.data.length >= filterParams.limit);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { setPage(1); setFoods([]); setHasMore(true); fetchFoods(false); }, [activeCategory]);
    useEffect(() => { if (page > 1) fetchFoods(true); }, [page]);
    const onRefresh = () => { setRefreshing(true); setPage(1); setHasMore(true); fetchFoods(false); };
    const loadMore = () => { if (!loading && hasMore && foods.length > 0) setPage(p => p + 1); };

    const activeCat = CATEGORIES.find(c => c.id === activeCategory);

    return (
        <LinearGradient
            colors={['#F0FDF9', '#EFF6FF', '#FDF4FF']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#10B981', letterSpacing: 1, marginBottom: 2 }}>
                            KHÁM PHÁ
                        </Text>
                        <Text style={{ fontSize: 22, fontWeight: '900', color: '#0F172A', lineHeight: 28 }}>
                            {getGreeting()}
                        </Text>
                        <Text style={{ fontSize: 13, color: '#94A3B8', fontWeight: '500', marginTop: 2 }}>
                            Hôm nay bạn muốn ăn gì?
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            onPress={() => router.push('/food/favorites')}
                            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF1F2', borderWidth: 1.5, borderColor: '#FECDD3', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Feather name="heart" size={20} color="#F43F5E" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/food/food-search')}
                    style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: '#FFFFFF', borderRadius: 18,
                        paddingHorizontal: 16, paddingVertical: 14,
                        borderWidth: 1.5, borderColor: '#E2E8F0',
                        shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
                        marginBottom: 18, gap: 12,
                    }}
                >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="search" size={18} color="#10B981" />
                    </View>
                    <Text style={{ flex: 1, fontSize: 15, color: '#94A3B8', fontWeight: '500' }}>
                        Tìm kiếm món ăn, nguyên liệu...
                    </Text>
                    <View style={{ backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>Tìm</Text>
                    </View>
                </TouchableOpacity>

                {/* Category Tabs */}
                <FlatList
                    data={CATEGORIES}
                    keyExtractor={i => i.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                    renderItem={({ item }) => (
                        <CategoryTab
                            item={item}
                            isActive={activeCategory === item.id}
                            onPress={() => setActiveCategory(item.id)}
                        />
                    )}
                />
            </View>

            {/* Divider + Count */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
                <View style={{ marginHorizontal: 10, backgroundColor: activeCat?.bg || '#ECFDF5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: activeCat?.color || '#10B981' }}>
                        {foods.length} món
                    </Text>
                </View>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            </View>

            {/* Food Grid */}
            <FlatList
                data={foods}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 110, paddingTop: 4 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item, index }) => (
                    <FoodCard
                        item={item}
                        index={index}
                        onPress={() => {
                            let contextMeal = 'snack';
                            const cat = CATEGORIES.find(c => c.id === activeCategory);
                            if (cat && cat.type === 'meal') contextMeal = cat.id;
                            else contextMeal = getMealByTime();
                            router.push({ pathname: '/food/food-detail', params: { id: item.id, mealType: contextMeal } });
                        }}
                    />
                )}
                ListEmptyComponent={
                    !loading ? (
                        <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: 'center', paddingTop: 60 }}>
                            <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <MaterialCommunityIcons name="food-off-outline" size={40} color="#A7F3D0" />
                            </View>
                            <Text style={{ fontSize: 17, fontWeight: '800', color: '#64748B', marginBottom: 6 }}>Không có món ăn nào</Text>
                            <Text style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>
                                Thử chọn bữa ăn khác hoặc kéo xuống để làm mới
                            </Text>
                        </Animated.View>
                    ) : null
                }
                ListFooterComponent={
                    loading ? (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#10B981" />
                        </View>
                    ) : <View style={{ height: 10 }} />
                }
            />
        </LinearGradient>
    );
}