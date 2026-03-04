import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { foodService, Food } from '../../services/foodService';

const { width } = Dimensions.get('window');

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

const resolveImg = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};


export default function FoodSearchScreen() {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [submittedQuery, setSubmittedQuery] = useState('');
    const [isSearching, setIsSearching] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const handleBack = () => {
        if (submittedQuery) {
            setSubmittedQuery('');
            setIsSearching(true);
        } else {
            router.back();
        }
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!query || query === submittedQuery) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await foodService.search({ search: query, limit: 10 });
                const names = Array.from(new Set(res.data.map(f => f.name)));
                setSuggestions(names);
            } catch (error) {
                console.log(error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query, submittedQuery]);

    const fetchFoods = async (isLoadMore = false) => {
        if (loading || !submittedQuery) return;
        try {
            setLoading(true);
            const res = await foodService.search({ limit: 20, page: isLoadMore ? page : 1, search: submittedQuery });
            if (isLoadMore) setFoods(prev => [...prev, ...res.data]);
            else setFoods(res.data);
            setHasMore(res.data.length >= 20);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (submittedQuery) { setPage(1); setFoods([]); setHasMore(true); fetchFoods(false); }
    }, [submittedQuery]);

    useEffect(() => {
        if (page > 1 && submittedQuery) fetchFoods(true);
    }, [page]);

    const onSubmitSearch = () => {
        if (!query.trim()) return;
        setSubmittedQuery(query);
        setIsSearching(false);
    };

    const loadMore = () => {
        if (!loading && hasMore && foods.length > 0) setPage(p => p + 1);
    };

    const handleSelectFood = (food: Food) => {
        const hour = new Date().getHours();
        let contextMeal = 'snack';
        if (hour >= 4 && hour < 11) contextMeal = 'breakfast';
        else if (hour >= 11 && hour < 14) contextMeal = 'lunch';
        else if (hour >= 14 && hour < 18) contextMeal = 'snack';
        else if (hour >= 18 && hour < 22) contextMeal = 'dinner';

        router.push({ pathname: '/food/food-detail', params: { id: food.id, mealType: contextMeal } });
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />

            {/* Sticky Header Blur Overlay */}
            <BlurView tint="light" intensity={90} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top + 16, paddingBottom: 16 }}>
                <View className="flex-row items-center px-5">
                    <TouchableOpacity onPress={handleBack} className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200 mr-3">
                        <Feather name="arrow-left" size={20} color="#334155" />
                    </TouchableOpacity>

                    <View className="flex-1 flex-row items-center h-14 bg-white/40 rounded-full px-4 shadow-sm shadow-slate-200 border border-white/50">
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            className="flex-1 ml-3 text-[15px] text-slate-800 font-medium"
                            placeholder="Bạn muốn ăn gì?"
                            value={query}
                            autoFocus={true}
                            onChangeText={(text) => {
                                setQuery(text);
                                if (!isSearching) setIsSearching(true);
                            }}
                            onFocus={() => setIsSearching(true)}
                            onSubmitEditing={onSubmitSearch}
                            placeholderTextColor="#94A3B8"
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => {
                                setQuery(''); setSubmittedQuery(''); setSuggestions([]); setIsSearching(true);
                            }} className="p-1">
                                <Ionicons name="close-circle" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </BlurView>

            {isSearching || !submittedQuery ? (
                <View className="flex-1 pt-4" style={{ marginTop: insets.top + 80 }}>
                    <Text className="text-[12px] font-black text-slate-400 tracking-widest px-5 mb-4 uppercase">Gợi ý tìm kiếm</Text>
                    {suggestions.length > 0 ? (
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item, idx) => 'sug_' + idx}
                            renderItem={({ item, index }) => (
                                <Animated.View entering={FadeInDown.delay(index * 30)}>
                                    <TouchableOpacity
                                        className="py-3.5 px-5 flex-row items-center border-b border-white/40"
                                        onPress={() => { setQuery(item); setSubmittedQuery(item); setIsSearching(false); }}
                                    >
                                        <Feather name="search" size={16} color="#94A3B8" />
                                        <Text className="ml-3 text-slate-700 text-[15px] font-medium">{item}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        />
                    ) : (
                        <View className="items-center justify-center mt-10">
                            <MaterialCommunityIcons name="cloud-search-outline" size={64} color="#CBD5E1" />
                            <Text className="text-slate-400 italic mt-3 text-center px-10">Gõ tên món ăn để bắt đầu (VD: Cơm tấm...)</Text>
                        </View>
                    )}
                </View>
            ) : (
                <FlatList
                    data={foods}
                    key={`list`}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 100 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={
                        <View className="px-5 mb-5 shrink-0">
                            <Text className="text-[18px] font-bold text-slate-800">
                                Kết quả cho <Text className="text-orange-500">"{submittedQuery}"</Text>
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <Animated.View entering={FadeInDown} className="items-center mt-20 opacity-80">
                                <MaterialCommunityIcons name="food-off" size={48} color="#94A3B8" />
                                <Text className="text-slate-500 text-[16px] font-bold mt-4">Không tìm thấy món ăn!</Text>
                            </Animated.View>
                        ) : null
                    }
                    renderItem={({ item, index }) => {
                        const img = resolveImg(item.image as string | undefined);
                        return (
                            <Animated.View entering={FadeInDown.delay(index * 50).springify()} className="px-5 mb-4">
                                <TouchableOpacity
                                    onPress={() => handleSelectFood(item)}
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
                                            <Text className="text-[14px] font-black text-slate-700">{Math.round(item.calories)} <Text className="text-[11px] text-slate-400 font-bold">kcal</Text></Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    }}
                    ListFooterComponent={
                        loading ? (
                            <View className="items-center py-4">
                                <ActivityIndicator size="small" color="#F97316" />
                            </View>
                        ) : <View className="h-4" />
                    }
                />
            )}
        </View>
    );
}
