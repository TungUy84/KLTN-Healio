import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Image,
    ActivityIndicator, Dimensions, RefreshControl, StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { foodService, Food } from '../../services/foodService';
import { userService } from '../../services/userService';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// --- CẤU HÌNH CATEGORIES ---
const CATEGORIES = [
    { id: 'all', name: 'Gợi ý', icon: 'star', activeColor: '#10B981', activeBg: 'bg-emerald-500', type: 'all' },
    { id: 'breakfast', name: 'Sáng', icon: 'sunrise', activeColor: '#F97316', activeBg: 'bg-orange-500', type: 'meal' },
    { id: 'lunch', name: 'Trưa', icon: 'sun', activeColor: '#EAB308', activeBg: 'bg-yellow-500', type: 'meal' },
    { id: 'dinner', name: 'Tối', icon: 'moon', activeColor: '#6366F1', activeBg: 'bg-indigo-500', type: 'meal' },
    { id: 'snack', name: 'Phụ', icon: 'coffee', activeColor: '#EC4899', activeBg: 'bg-pink-500', type: 'meal' },
    { id: 'high_protein', name: 'Giàu Đạm', icon: 'activity', activeColor: '#EF4444', activeBg: 'bg-red-500', type: 'sort', param: 'protein' },
    { id: 'low_carb', name: 'Ít Carb', icon: 'zap', activeColor: '#8B5CF6', activeBg: 'bg-violet-500', type: 'tag', param: 'low_carb' },
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
    if (h < 6) return 'Buổi sáng sớm';
    if (h < 11) return 'Chào buổi sáng';
    if (h < 14) return 'Giờ ăn trưa rồi';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
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
        activeOpacity={0.75}
        className={`flex-row items-center mr-2.5 py-2 px-3.5 rounded-full border-[1.5px] ${isActive ? `${item.activeBg} border-transparent` : 'bg-white border-slate-200'}`}
    >
        <Feather name={item.icon as any} size={14} color={isActive ? '#fff' : item.activeColor} />
        <Text className={`text-[13px] font-bold ml-1.5 ${isActive ? 'text-white' : 'text-slate-500'}`}>
            {item.name}
        </Text>
    </TouchableOpacity>
);

// --- FOOD CARD ---
const FoodCard = ({ item, index, onPress }: { item: Food; index: number; onPress: () => void }) => {
    const img = resolveImg(item.image as string | undefined);
    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={{ width: CARD_W, marginBottom: 16 }}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.88}
                className="bg-white rounded-[24px] overflow-hidden border-[1.5px] border-slate-100 shadow-sm shadow-slate-200"
            >
                {/* Ảnh */}
                <View className="h-32 bg-slate-100 relative">
                    {img ? (
                        <Image source={{ uri: img }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="flex-1 items-center justify-center bg-emerald-50">
                            <MaterialCommunityIcons name="food-variant" size={40} color="#A7F3D0" />
                        </View>
                    )}
                    {/* Gradient scrim */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.42)']}
                        className="absolute bottom-0 left-0 right-0 h-14"
                    />
                    {/* Calo badge trên ảnh */}
                    <View className="absolute bottom-2 left-2 bg-white/90 rounded-xl px-2 py-0.5 flex-row items-center gap-1">
                        <MaterialCommunityIcons name="fire" size={12} color="#F97316" />
                        <Text className="text-[12px] font-black text-orange-500">{Math.round(item.calories)}</Text>
                        <Text className="text-[10px] text-slate-400 font-semibold">kcal</Text>
                    </View>
                </View>

                {/* Info */}
                <View className="p-3">
                    <Text className="text-sm font-black text-slate-800 leading-5 mb-2" numberOfLines={2}>
                        {item.name}
                    </Text>

                    {/* Macro chips */}
                    <View className="flex-row flex-wrap gap-1 mb-2.5">
                        <View className="bg-amber-50 rounded-md px-1.5 py-0.5 border border-amber-100">
                            <Text className="text-[10px] font-bold text-amber-600">C {Math.round(item.carb)}g</Text>
                        </View>
                        <View className="bg-blue-50 rounded-md px-1.5 py-0.5 border border-blue-100">
                            <Text className="text-[10px] font-bold text-blue-600">P {Math.round(item.protein)}g</Text>
                        </View>
                        <View className="bg-rose-50 rounded-md px-1.5 py-0.5 border border-rose-100">
                            <Text className="text-[10px] font-bold text-rose-500">F {Math.round(item.fat)}g</Text>
                        </View>
                    </View>

                    {/* Bottom row */}
                    <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] text-slate-400 font-medium">1 {item.serving_unit || 'suất'}</Text>
                        <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center border border-emerald-100">
                            <Feather name="plus" size={15} color="#10B981" />
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
                    if (userDietMode === 'muscle_gain' || userDietMode === 'high_protein') { filterParams.sort = 'protein'; filterParams.order = 'DESC'; }
                    else if (userDietMode === 'weight_loss' || userDietMode === 'low_carb') { filterParams.sort = 'carb'; filterParams.order = 'ASC'; }
                    else if (userDietMode === 'keto') { filterParams.diet_tag = 'keto'; }
                } else if (category.type === 'meal') {
                    filterParams.meal_category = category.id;
                } else if (category.type === 'sort') {
                    filterParams.sort = (category as any).param; filterParams.order = 'DESC';
                } else if (category.type === 'tag') {
                    filterParams.diet_tag = (category as any).param;
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
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View className="px-5 bg-white border-b border-slate-100" style={{ paddingTop: insets.top + 12, paddingBottom: 14 }}>
                {/* Title row */}
                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <Text className="text-[11px] font-bold text-emerald-500 tracking-widest mb-1">KHÁM PHÁ</Text>
                        <Text className="text-xl font-black text-slate-900">{getGreeting()}</Text>
                        <Text className="text-sm text-slate-400 font-medium mt-0.5">Hôm nay bạn muốn ăn gì?</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/food/favorites')}
                        className="w-11 h-11 rounded-2xl bg-rose-50 border-[1.5px] border-rose-100 items-center justify-center"
                    >
                        <Feather name="heart" size={20} color="#F43F5E" />
                    </TouchableOpacity>
                </View>

                {/* Search bar */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/food/food-search')}
                    className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 border-[1.5px] border-slate-200 mb-4 gap-3"
                >
                    <View className="w-8 h-8 rounded-xl bg-emerald-100 items-center justify-center">
                        <Feather name="search" size={16} color="#10B981" />
                    </View>
                    <Text className="flex-1 text-[15px] text-slate-400 font-medium">Tìm kiếm món ăn...</Text>
                    <View className="bg-white rounded-lg px-2 py-1 border border-slate-200">
                        <Text className="text-[11px] font-bold text-slate-500">Tìm</Text>
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

            {/* Count row */}
            <View className="flex-row items-center px-5 py-3">
                <View className="flex-1 h-px bg-slate-100" />
                <View className="mx-3 px-3 py-1 rounded-lg" style={{ backgroundColor: activeCat?.activeColor + '20' }}>
                    <Text className="text-xs font-bold" style={{ color: activeCat?.activeColor }}>
                        {foods.length} món
                    </Text>
                </View>
                <View className="flex-1 h-px bg-slate-100" />
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
                        <Animated.View entering={FadeInDown.duration(400)} className="items-center pt-16">
                            <View className="w-20 h-20 rounded-[24px] bg-emerald-50 items-center justify-center mb-4">
                                <MaterialCommunityIcons name="food-off-outline" size={40} color="#A7F3D0" />
                            </View>
                            <Text className="text-lg font-black text-slate-500 mb-1.5">Không có món ăn nào</Text>
                            <Text className="text-sm text-slate-400 text-center">Thử chọn bữa ăn khác hoặc kéo xuống làm mới</Text>
                        </Animated.View>
                    ) : null
                }
                ListFooterComponent={
                    loading
                        ? <View className="py-6 items-center"><ActivityIndicator size="small" color="#10B981" /></View>
                        : <View className="h-2" />
                }
            />
        </View>
    );
}