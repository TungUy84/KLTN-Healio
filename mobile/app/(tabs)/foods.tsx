import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions, RefreshControl, TextInput
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { foodService, Food } from '../../services/foodService';
import { userService } from '../../services/userService';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2 - 5; // Gap calculation

// CATEGORIES CONFIG
const CATEGORIES = [
    { id: 'all', name: 'Gợi ý', icon: 'star', color: '#10B981', type: 'all' },
    { id: 'breakfast', name: 'Sáng', icon: 'sunrise', color: '#F97316', type: 'meal' },
    { id: 'lunch', name: 'Trưa', icon: 'sun', color: '#EAB308', type: 'meal' },
    { id: 'dinner', name: 'Tối', icon: 'moon', color: '#6366F1', type: 'meal' },
    { id: 'snack', name: 'Phụ', icon: 'coffee', color: '#EC4899', type: 'meal' },
    { id: 'high_protein', name: 'Giàu Đạm', icon: 'activity', color: '#EF4444', type: 'sort', param: 'protein' },
    { id: 'low_carb', name: 'Ít Carb', icon: 'zap', color: '#8B5CF6', type: 'tag', param: 'low_carb' },
];

const getMealByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 18) return 'snack';
    if (hour >= 18 && hour < 22) return 'dinner';
    return 'snack';
};

export default function FoodsScreen() {
    const params = useLocalSearchParams();

    const [activeCategory, setActiveCategory] = useState<string>(() => {
        if (params.meal) return params.meal as string;
        return 'all';
    });

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
        }).catch(err => console.log('Fetching profile failed', err));
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
                    switch (userDietMode) {
                        case 'muscle_gain': case 'high_protein': filterParams.sort = 'protein'; filterParams.order = 'DESC'; break;
                        case 'weight_loss': case 'low_carb': filterParams.sort = 'carb'; filterParams.order = 'ASC'; break;
                        case 'keto': filterParams.diet_tag = 'keto'; break;
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

        } catch (error) {
            console.error('Fetch foods error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { setPage(1); setFoods([]); setHasMore(true); fetchFoods(false); }, [activeCategory]);
    useEffect(() => { if (page > 1) fetchFoods(true); }, [page]);

    const onRefresh = () => { setRefreshing(true); setPage(1); setHasMore(true); fetchFoods(false); };
    const loadMore = () => { if (!loading && hasMore && foods.length > 0) setPage(prev => prev + 1); };

    // --- RENDER ITEMS ---

    const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isActive = activeCategory === item.id;
        return (
            <TouchableOpacity
                onPress={() => setActiveCategory(item.id)}
                className={`mr-3 py-2 px-4 rounded-full flex-row items-center border ${isActive ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-200'}`}
                activeOpacity={0.7}
            >
                <Feather name={item.icon as any} size={16} color={isActive ? 'white' : item.color} />
                <Text className={`text-sm font-semibold ml-2 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderFoodCard = ({ item, index }: { item: Food, index: number }) => (
        <AnimatedTouchableOpacity
            entering={FadeInDown.delay(index * 50).springify()}
            className="bg-white rounded-3xl mb-4 shadow-sm shadow-slate-200"
            style={{ width: COLUMN_WIDTH }}
            onPress={() => {
                let contextMeal = 'snack';
                const category = CATEGORIES.find(c => c.id === activeCategory);
                if (category && category.type === 'meal') contextMeal = category.id;
                else contextMeal = getMealByTime();

                router.push({ pathname: '/food/food-detail', params: { id: item.id, mealType: contextMeal } });
            }}
            activeOpacity={0.8}
        >
            <View className="h-32 w-full bg-slate-100 rounded-t-3xl overflow-hidden relative">
                {item.image ? (
                    <Image
                        source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${item.image}` }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-full items-center justify-center bg-teal-50">
                        <Feather name="image" size={32} color="#CBD5E1" />
                    </View>
                )}
                <View className="absolute top-2 right-2 bg-black/40 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[10px] font-bold">{Math.round(item.calories)} kcal</Text>
                </View>
            </View>

            <View className="p-3">
                <Text className="font-bold text-slate-800 text-sm leading-5 mb-1" numberOfLines={2}>
                    {item.name}
                </Text>
                <View className="flex-row items-center mt-2 justify-between">
                    <View className="flex-row items-center">
                        <Feather name="clock" size={12} color="#94A3B8" />
                        <Text className="text-xs text-slate-400 ml-1">5m</Text>
                    </View>
                    <View className="w-7 h-7 bg-teal-50 rounded-full items-center justify-center border border-teal-100">
                        <Feather name="plus" size={16} color="#0D9488" />
                    </View>
                </View>
            </View>
        </AnimatedTouchableOpacity>
    );

    const getDynamicTitle = () => {
        const category = CATEGORIES.find(c => c.id === activeCategory);
        if (!category || category.id === 'all') {
            const h = new Date().getHours();
            let greeting = 'Chào buổi sáng';
            if (h >= 11 && h < 14) greeting = 'Chào buổi trưa';
            else if (h >= 14 && h < 18) greeting = 'Chào buổi chiều';
            else if (h >= 18) greeting = 'Chào buổi tối';
            return `${greeting}, hôm nay ăn gì?`;
        }
        return `Thực đơn ${category.name}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
            {/* Header */}
            <View className="px-5 pt-2 pb-4 bg-[#F8FAFC] z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Discovery</Text>
                        <Text className="text-2xl font-black text-slate-800">{getDynamicTitle()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/food/favorites')} className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm">
                        <Feather name="heart" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push('/food/food-search')}
                    className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-slate-200 shadow-sm"
                >
                    <Feather name="search" size={20} color="#94A3B8" />
                    <Text className="flex-1 ml-3 text-base text-slate-400 font-medium">Tìm kiếm món ăn...</Text>
                </TouchableOpacity>

                {/* Categories */}
                <View className="mt-5">
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategoryItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                    />
                </View>
            </View>

            {/* Content Body */}
            <FlatList
                data={foods}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center mt-20 opacity-50">
                            <Feather name="coffee" size={40} color="#94A3B8" />
                            <Text className="text-slate-500 text-lg font-medium mt-4">Không tìm thấy món ăn</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item, index }) => renderFoodCard({ item, index })}
                ListFooterComponent={loading ? <ActivityIndicator className="mt-4" size="small" color="#0D9488" /> : <View className="h-10" />}
            />
        </SafeAreaView>
    );
}