import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Dimensions,
    RefreshControl
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    MagnifyingGlassIcon,
    HeartIcon as HeartIconOutline,
    SparklesIcon,
    SunIcon,
    GlobeAmericasIcon,
    MoonIcon,
    CakeIcon,
    FireIcon,
    BoltIcon,
    StarIcon,
    ClockIcon
} from "react-native-heroicons/solid";
import { foodService, Food } from '../../services/foodService';
import { Colors } from '../../constants/Colors';
import { userService } from '../../services/userService';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const CATEGORIES = [
    { id: 'all', name: 'Gợi ý', icon: SparklesIcon, bg: 'bg-emerald-50', color: '#10B981', type: 'all' },
    { id: 'breakfast', name: 'Bữa Sáng', icon: SunIcon, bg: 'bg-orange-50', color: '#F97316', type: 'meal' },
    { id: 'lunch', name: 'Bữa Trưa', icon: GlobeAmericasIcon, bg: 'bg-blue-50', color: '#3B82F6', type: 'meal' },
    { id: 'dinner', name: 'Bữa Tối', icon: MoonIcon, bg: 'bg-indigo-50', color: '#6366F1', type: 'meal' },
    { id: 'snack', name: 'Bữa Phụ', icon: CakeIcon, bg: 'bg-pink-50', color: '#EC4899', type: 'meal' },
    { id: 'high_protein', name: 'Giàu Đạm', icon: FireIcon, bg: 'bg-red-50', color: '#EF4444', type: 'sort', param: 'protein' },
    { id: 'low_carb', name: 'Low Carb', icon: BoltIcon, bg: 'bg-yellow-50', color: '#EAB308', type: 'tag', param: 'low_carb' },
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
        }).catch(err => {
            console.log('Fetching profile failed', err);
        });
    }, []);

    const fetchFoods = async (isLoadMore = false) => {
        if (loading) return;
        try {
            setLoading(true);

            const filterParams: any = { limit: 20, page: isLoadMore ? page : 1 };

            // Normal Discovery Logic
            const category = CATEGORIES.find(c => c.id === activeCategory);

            if (category) {
                if (category.id === 'all') {
                    filterParams.meal_category = getMealByTime();
                    switch (userDietMode) {
                        case 'muscle_gain':
                        case 'high_protein':
                            filterParams.sort = 'protein'; filterParams.order = 'DESC'; break;
                        case 'weight_loss':
                        case 'low_carb':
                            filterParams.sort = 'carb'; filterParams.order = 'ASC'; break;
                        case 'keto':
                            filterParams.diet_tag = 'keto'; break;
                    }
                } else if (category.type === 'meal') {
                    filterParams.meal_category = category.id;
                } else if (category.type === 'sort') {
                    filterParams.sort = category.param;
                    filterParams.order = 'DESC';
                } else if (category.type === 'tag') {
                    filterParams.diet_tag = category.param;
                }
            }

            const res = await foodService.search(filterParams);

            if (isLoadMore) {
                setFoods(prev => [...prev, ...res.data]);
            } else {
                setFoods(res.data);
            }

            setHasMore(res.data.length >= filterParams.limit);

        } catch (error) {
            console.error('Fetch foods error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Reset when category changes
    useEffect(() => {
        setPage(1);
        setFoods([]);
        setHasMore(true);
        fetchFoods(false);
    }, [activeCategory]);

    // Load More Effect
    useEffect(() => {
        if (page > 1) fetchFoods(true);
    }, [page]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchFoods(false);
    };

    const loadMore = () => {
        if (!loading && hasMore && foods.length > 0) {
            setPage(prev => prev + 1);
        }
    };

    const handleSelectFood = (food: Food) => {
        let contextMeal = 'snack';

        const category = CATEGORIES.find(c => c.id === activeCategory);
        if (category && category.type === 'meal') {
            contextMeal = category.id;
        } else {
            contextMeal = getMealByTime();
        }

        router.push({
            pathname: '/food/food-detail',
            params: {
                id: food.id,
                mealType: contextMeal
            }
        });
    };

    const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isActive = activeCategory === item.id;
        return (
            <TouchableOpacity
                onPress={() => setActiveCategory(item.id)}
                className="items-center mr-6"
            >
                <View
                    className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${isActive ? 'bg-primary' : item.bg}`}
                    style={isActive ? { shadowColor: item.color, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 } : {}}
                >
                    <item.icon size={24} color={isActive ? 'white' : item.color} />
                </View>
                <Text className={`text-xs font-medium ${isActive ? 'text-primary font-bold' : 'text-gray-500'}`}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderFoodCard = ({ item }: { item: Food }) => (
        <TouchableOpacity
            className="bg-white rounded-2xl mb-5 shadow-sm border border-gray-100/50 pb-3"
            style={{ width: COLUMN_WIDTH }}
            onPress={() => handleSelectFood(item)}
            activeOpacity={0.7}
        >
            <View className="h-32 rounded-t-2xl overflow-hidden bg-gray-50 relative">
                {item.image ? (
                    <Image
                        source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${item.image}` }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <Text className="text-3xl">🍲</Text>
                    </View>
                )}
            </View>

            <View className="px-3 pt-3">
                <Text className="font-bold text-gray-800 text-[15px] leading-5 mb-1" numberOfLines={1}>
                    {item.name}
                </Text>
                <Text className="text-xs text-gray-400 mb-2 h-8" numberOfLines={2}>
                    {item.cooking || item.description || 'Chưa có mô tả'}
                </Text>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <FireIcon size={14} color="#EF4444" />
                        <Text className="text-xs font-bold text-gray-700 ml-1">
                            {Math.round(item.calories)} Kcal
                        </Text>
                    </View>
                    <View className="bg-gray-50 w-6 h-6 rounded-full items-center justify-center border border-gray-100">
                        <Text className="text-gray-400 text-xs">+</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getDynamicTitle = () => {
        const category = CATEGORIES.find(c => c.id === activeCategory);
        if (!category || category.id === 'all') {
            const mealTime = getMealByTime();
            const mealName = CATEGORIES.find(c => c.id === mealTime)?.name || 'Hôm nay';

            // Translate diet mode for display
            let dietLabel = '';
            if (userDietMode === 'high_protein' || userDietMode === 'muscle_gain') dietLabel = ' • Giàu đạm';
            else if (userDietMode === 'low_carb' || userDietMode === 'weight_loss') dietLabel = ' • Ít Carb';
            else if (userDietMode === 'keto') dietLabel = ' • Keto';
            else dietLabel = ' • Cân bằng';

            return `Gợi ý ${mealName}${dietLabel}`;
        }
        return category.name;
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="bg-white z-10">
                <View className="px-5 pt-2 pb-2 flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Hôm nay ăn gì?</Text>
                        <Text className="text-2xl font-extrabold text-gray-800">
                            Thực đơn gợi ý
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/food/favorites')}
                        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
                    >
                        <HeartIconOutline size={22} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View className="px-5 py-3">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/food/food-search')}
                        className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100"
                    >
                        <MagnifyingGlassIcon size={20} color="#9CA3AF" />
                        <Text className="flex-1 ml-3 text-base text-gray-400">
                            Tìm món ăn...
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="pl-5 pb-2">
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategoryItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20, paddingTop: 10, paddingBottom: 10 }}
                    />
                </View>
            </View>

            <View className="flex-1 bg-gray-50/50">
                <View className="px-5 py-4 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-800">
                        {getDynamicTitle()}
                    </Text>
                </View>

                <FlatList
                    data={foods}
                    key={`grid-${2}`}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        !loading ? (
                            <View className="items-center mt-20 opacity-40">
                                <MagnifyingGlassIcon size={40} color="#9CA3AF" />
                                <Text className="text-gray-500 text-lg font-medium mt-4">Không tìm thấy món ăn</Text>
                            </View>
                        ) : null
                    }
                    renderItem={renderFoodCard}
                    ListFooterComponent={loading ? <ActivityIndicator className="mt-4" size="large" color={Colors.primary} /> : <View className="h-20" />}
                />
            </View>
        </SafeAreaView>
    );
}