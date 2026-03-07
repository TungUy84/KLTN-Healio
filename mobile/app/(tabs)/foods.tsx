import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Image,
    ActivityIndicator, Dimensions, RefreshControl, StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, LinearTransition, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, useAnimatedScrollHandler } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop, Path } from 'react-native-svg';
import { foodService, Food } from '../../services/foodService';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useWalkthrough } from '../../context/WalkthroughContext';

const { width } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// --- CẤU HÌNH CATEGORIES ---
const CATEGORIES = [
    { id: 'all', name: 'Gợi ý', type: 'all' },
    { id: 'breakfast', name: 'Sáng', type: 'meal' },
    { id: 'lunch', name: 'Trưa', type: 'meal' },
    { id: 'dinner', name: 'Tối', type: 'meal' },
    { id: 'snack', name: 'Phụ', type: 'meal' },
    { id: 'high_protein', name: 'Giàu Đạm', type: 'sort', param: 'protein' },
    { id: 'low_carb', name: 'Ít Carb', type: 'tag', param: 'low_carb' },
];

const getMealByTime = () => {
    const h = new Date().getHours();
    if (h >= 4 && h < 11) return 'breakfast';
    if (h >= 11 && h < 14) return 'lunch';
    if (h >= 14 && h < 18) return 'snack';
    return 'dinner';
};

const resolveImg = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
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
    </View>
);

// --- SQUARE CARD (POPULAR FOODS) ---
const PopularFoodCard = ({ item, index, onPress }: { item: Food, index: number, onPress: () => void }) => {
    const img = resolveImg(item.image as string | undefined);
    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()} className="mr-4 mb-2 mt-4 text-center">
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                className="bg-white/80 rounded-[32px] p-4 pb-5 items-center border border-white/60"
                style={{ width: width * 0.45, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15 }}
            >
                <View className="w-32 h-32 rounded-full mb-5 shadow-lg shadow-slate-300 bg-slate-100" style={{ marginTop: -20, shadowColor: '#334155', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 12 }}>
                    {img ? (
                        <Image source={{ uri: img }} className="w-full h-full rounded-full" />
                    ) : (
                        <View className="flex-1 items-center justify-center bg-emerald-50 rounded-full">
                            <MaterialCommunityIcons name="food-variant" size={40} color="#A7F3D0" />
                        </View>
                    )}
                </View>
                <Text className="text-[15px] font-black text-slate-800 text-center mb-1 w-full" numberOfLines={1}>{item.name}</Text>
                <View className="flex-row items-center justify-center gap-1 mt-1 w-full">
                    <MaterialCommunityIcons name="fire" size={14} color="#F97316" />
                    <Text className="text-[14px] font-black text-slate-700">{Math.round(item.calories)}
                        <Text className="text-[11px] text-slate-400 font-bold"> kcal</Text>
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- HORIZONTAL WIDE CARD (SPECIALS) ---
const SpecialFoodCard = ({ item, index, onPress }: { item: Food, index: number, onPress: () => void }) => {
    const img = resolveImg(item.image as string | undefined);
    return (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()} className="px-5 mb-4">
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                className="bg-white/70 rounded-[28px] p-3 pl-3 pr-5 flex-row items-center border border-white/60"
                style={{ shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 12 }}
            >
                <View className="w-[88px] h-[88px] rounded-full bg-slate-100 shadow-md shadow-slate-200 mr-4" style={{ shadowColor: '#334155', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 8 }}>
                    {img ? (
                        <Image source={{ uri: img }} className="w-full h-full rounded-full" />
                    ) : (
                        <View className="flex-1 items-center justify-center bg-emerald-50 rounded-full">
                            <MaterialCommunityIcons name="food-variant" size={30} color="#A7F3D0" />
                        </View>
                    )}
                </View>
                <View className="flex-1 py-1">
                    <Text className="text-[16px] font-black text-slate-800 mb-1" numberOfLines={2}>{item.name}</Text>
                    <Text className="text-[12px] text-slate-500 mb-2 leading-4" numberOfLines={2}>
                        {item.description || item.cooking || "Chưa có mô tả chi tiết cho món ăn này."}
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <MaterialCommunityIcons name="fire" size={14} color="#F97316" />
                        <Text className="text-[14px] font-black text-slate-700">{Math.round(item.calories)}
                            <Text className="text-[11px] text-slate-400 font-bold"> kcal</Text>
                        </Text>
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
    const [popularFoods, setPopularFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userDietMode, setUserDietMode] = useState<string>('balanced');

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => { scrollY.value = e.contentOffset.y; }
    });
    const headerBlurStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolation.CLAMP)
    }));

    // Walkthrough Logic
    const { startWalkthrough, registerStep, unregisterStep } = useWalkthrough();
    const searchRef = React.useRef<View>(null);
    const categoryRef = React.useRef<View>(null);
    const favoriteRef = React.useRef<View>(null);

    useEffect(() => {
        registerStep("funds_search", searchRef, () => { });
        registerStep("funds_category", categoryRef, () => { });
        registerStep("funds_favorite", favoriteRef, () => { });
        return () => {
            unregisterStep("funds_search");
            unregisterStep("funds_category");
            unregisterStep("funds_favorite");
        };
    }, []);

    useEffect(() => {
        const checkTutorial = async () => {
            const hasSeen = await authService.checkEpicTutorial('foods');
            if (!hasSeen) {
                setTimeout(() => {
                    startWalkthrough([
                        { name: 'funds_search', title: 'Tìm kiếm Món Ăn', content: 'Nhấn vào đây để gõ tên món ăn bạn muốn tìm kiếm, từ phở, bún, đến các món nhậu.' },
                        { name: 'funds_category', title: 'Lọc Theo Bữa', content: 'Chọn nhanh danh sách thực đơn phù hợp cho các buổi Sáng, Trưa, Tối, hoặc các chế độ đặc biệt.' },
                        { name: 'funds_favorite', title: 'Mục Yêu Thích', content: 'Những món bạn đã thả tim sẽ được lưu giữ tại đây để dễ dàng thêm vào thực đơn lần sau.' }
                    ], 'foods');
                }, 50);
            }
        };
        // Chỉ chạy sau khi load xong popular foods cho mượt
        if (!loading && popularFoods.length > 0) {
            checkTutorial();
        }
    }, [popularFoods.length, loading, startWalkthrough]);

    useEffect(() => {
        userService.getProfile().then(user => {
            if (user?.UserNutritionTarget?.DietPreset?.code) {
                setUserDietMode(user.UserNutritionTarget.DietPreset.code);
            }
        }).catch(() => { });

        // Fetch popular foods once
        foodService.getPopularFoods(8).then(res => setPopularFoods(res || [])).catch(() => { });
    }, []);

    const fetchFoods = async (isLoadMore = false) => {
        if (loading) return;
        try {
            setLoading(true);
            const filterParams: any = { limit: 10, page: isLoadMore ? page : 1 };
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

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        await foodService.getPopularFoods(8).then(res => setPopularFoods(res || [])).catch(() => { });
        fetchFoods(false);
    };
    const loadMore = () => { if (!loading && hasMore && foods.length > 0) setPage(p => p + 1); };

    const getContextMeal = () => {
        let contextMeal = 'snack';
        const cat = CATEGORIES.find(c => c.id === activeCategory);
        if (cat && cat.type === 'meal') contextMeal = cat.id;
        else contextMeal = getMealByTime();
        return contextMeal;
    };

    const renderHeader = () => (
        <View>

            {/* 3. Popular Foods (Horizontal) */}
            {activeCategory === 'all' && popularFoods.length > 0 && (
                <View className="mb-6">
                    <View className="flex-row justify-between items-end px-5 mb-5 mt-2">
                        <Text className="text-[22px] font-black text-slate-800 tracking-tight">Món ăn nổi bật</Text>
                        <TouchableOpacity onPress={() => router.push('/food/food-search')}>
                            <Text className="text-[13px] font-bold text-slate-500 mb-1">Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20, paddingRight: 6 }}
                        data={popularFoods}
                        keyExtractor={i => 'pop_' + i.id}
                        renderItem={({ item, index }) => (
                            <PopularFoodCard
                                item={item}
                                index={index}
                                onPress={() => router.push({ pathname: '/food/food-detail', params: { id: item.id, mealType: getContextMeal() } })}
                            />
                        )}
                    />
                </View>
            )}

            {/* 4. Main List Title */}
            <View className="px-5 mb-5 mt-6">
                <Text className="text-[22px] font-black text-slate-800 tracking-tight">
                    {activeCategory === 'all' ? 'Gợi ý hôm nay' :
                        CATEGORIES.find(c => c.id === activeCategory)?.name + ' dinh dưỡng'}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />

            {/* Sticky Header Blur Overlay */}
            <BlurView tint="light" intensity={90} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top + 16, paddingBottom: 16 }}>
                {/* 1. Header Navigation */}
                <View className="flex-row justify-between items-center px-5 mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200">
                        <Feather name="arrow-left" size={20} color="#334155" />
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-2">
                        <Text className="text-[22px] font-black text-slate-800 tracking-tight">Món Ăn</Text>
                    </View>

                    <View ref={favoriteRef}>
                        <TouchableOpacity className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200" onPress={() => router.push('/food/favorites')}>
                            <Feather name="heart" size={20} color="#F43F5E" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. Scrollable Filters */}
                <View className="px-5 flex-row items-center">
                    <View ref={searchRef} className="mr-3">
                        <TouchableOpacity onPress={() => router.push('/food/food-search')} className="w-[48px] h-[48px] rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200 mr-3">
                            <Feather name="search" size={20} color="#334155" />
                        </TouchableOpacity>
                    </View>
                    <View ref={categoryRef} className="flex-1">
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={CATEGORIES}
                            keyExtractor={i => i.id}
                            contentContainerStyle={{ paddingRight: 20 }}
                            renderItem={({ item }) => (
                                <AnimatedTouchableOpacity
                                    layout={LinearTransition.springify()}
                                    onPress={() => setActiveCategory(item.id)}
                                    className={`mr-3 px-5 py-3.5 rounded-full border shadow-sm ${activeCategory === item.id ? 'bg-white border-white shadow-slate-200' : 'bg-white/40 border-white/40 shadow-transparent'}`}
                                >
                                    <Text className={`text-[15px] font-bold ${activeCategory === item.id ? 'text-slate-800' : 'text-slate-500'}`}>{item.name}</Text>
                                </AnimatedTouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </BlurView>

            <Animated.FlatList
                data={foods}
                itemLayoutAnimation={LinearTransition.springify()}
                keyExtractor={(item) => 'food_' + item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 150 }}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" progressViewOffset={insets.top + 20} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item, index }) => (
                    <SpecialFoodCard
                        item={item}
                        index={index}
                        onPress={() => router.push({ pathname: '/food/food-detail', params: { id: item.id, mealType: getContextMeal() } })}
                    />
                )}
                ListEmptyComponent={
                    loading ? (
                        <Animated.View entering={FadeInDown.duration(300)} className="pt-1">
                            {[1, 2, 3, 4, 5].map(k => (
                                <View key={k} className="px-5 mb-4">
                                    <View className="bg-white/50 rounded-[28px] p-3 flex-row items-center border border-white/60">
                                        <View className="w-[88px] h-[88px] rounded-full bg-slate-200/80 mr-4" />
                                        <View className="flex-1 py-1">
                                            <View className="w-3/4 h-[18px] bg-slate-200/80 rounded mb-2.5" />
                                            <View className="w-full h-3 bg-slate-200/80 rounded mb-1.5" />
                                            <View className="w-5/6 h-3 bg-slate-200/80 rounded mb-3" />
                                            <View className="w-1/3 h-[14px] bg-slate-200/80 rounded" />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeInDown.duration(400)} className="items-center pt-10">
                            <View className="w-20 h-20 rounded-full bg-white/60 items-center justify-center mb-4 border border-white">
                                <MaterialCommunityIcons name="food-off-outline" size={40} color="#94A3B8" />
                            </View>
                            <Text className="text-[17px] font-black text-slate-800 mb-1.5">Chưa tìm thấy món ăn</Text>
                            <Text className="text-[14px] text-slate-500 text-center px-10">Đang cập nhật thêm thực đơn cho ngày hôm nay</Text>
                        </Animated.View>
                    )
                }
                ListFooterComponent={
                    loading
                        ? <View className="py-6 items-center"><ActivityIndicator size="small" color="#10B981" /></View>
                        : <View className="h-4" />
                }
            />
        </View>
    );
}