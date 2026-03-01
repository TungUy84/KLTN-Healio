import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Swipeable } from 'react-native-gesture-handler';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { foodService, Food } from '../../services/foodService';

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

// --- HORIZONTAL WIDE CARD ---
const FavoriteFoodCard = ({ item, index, onPress, onDelete }: { item: Food, index: number, onPress: () => void, onDelete: () => void }) => {
  const img = resolveImg(item.image as string | undefined);

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        onPress={onDelete}
        className="bg-red-500 justify-center items-center w-[88px] rounded-[28px] mb-4 mt-0 mr-5"
        style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
      >
        <Feather name="trash-2" size={24} color="white" />
        <Text className="text-white text-[10px] font-bold mt-1">Xóa</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <Animated.View entering={FadeInDown.delay(index * 50).springify()} className="px-5 mb-4">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={1}
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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <MaterialCommunityIcons name="fire" size={14} color="#F97316" />
                <Text className="text-[14px] font-black text-slate-700">{Math.round(item.calories)} <Text className="text-[11px] text-slate-400 font-bold">kcal</Text></Text>
              </View>
              <MaterialCommunityIcons name="heart" size={20} color="#F43F5E" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await foodService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const handleSelectFood = (food: Food) => {
    router.push({
      pathname: '/food/food-detail',
      params: { id: food.id }
    });
  };

  const handleDeleteFood = async (id: number) => {
    try {
      await foodService.toggleFavorite(id);
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientGlowBackground />

      {/* Sticky Header Blur Overlay */}
      <BlurView tint="light" intensity={90} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top + 16, paddingBottom: 16 }}>
        <View className="flex-row justify-between items-center px-5">
          <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200">
            <Feather name="arrow-left" size={20} color="#334155" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Text className="text-[22px] font-black text-slate-800 tracking-tight">Yêu Thích</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/(tabs)/foods')} className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200">
            <Feather name="plus" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>
      </BlurView>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 100 }}
        showsVerticalScrollIndicator={false}
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
            <Animated.View entering={FadeInDown.duration(400)} className="items-center mt-20">
              <View className="w-20 h-20 rounded-full bg-white/60 items-center justify-center mb-4 border border-white">
                <MaterialCommunityIcons name="heart-broken-outline" size={40} color="#94A3B8" />
              </View>
              <Text className="text-[17px] font-black text-slate-800 mb-1.5">Chưa có món yêu thích</Text>
              <Text className="text-[14px] text-slate-500 text-center px-10">Hãy thêm các món ăn bạn thích để dễ dàng theo dõi</Text>

              <TouchableOpacity
                className="mt-8 bg-orange-500 px-8 py-3.5 rounded-full shadow-md shadow-orange-500/30"
                onPress={() => router.push('/(tabs)/foods')}
              >
                <Text className="text-white font-bold text-[16px]">Khám phá ngay</Text>
              </TouchableOpacity>
            </Animated.View>
          )
        }
        renderItem={({ item, index }) => (
          <FavoriteFoodCard
            item={item}
            index={index}
            onPress={() => handleSelectFood(item)}
            onDelete={() => handleDeleteFood(item.id)}
          />
        )}
      />
    </View>
  );
}
