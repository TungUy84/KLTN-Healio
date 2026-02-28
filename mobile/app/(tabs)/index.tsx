import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Image, ImageBackground, Modal, ActivityIndicator, Alert, DeviceEventEmitter, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Wheat, Beef, Droplet, Flame } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { userService, CalculatedMetrics } from '../../services/userService';
import { foodService, Food } from '../../services/foodService';
import { aiService, MealPlanSuggestion } from '../../services/aiService';

const { width } = Dimensions.get('window');

// --- COMPONENTS CŨ PHỤC HỒI ---
const AnimatedView = Animated.createAnimatedComponent(View);

// 2. Calories Hero & Summary Cards
const CaloriesHero = ({ target, eaten, dailyLog, tCarb, tProt, tFat }: any) => {
  const percent = Math.min((eaten / target) * 100, 100) || 0;
  const left = Math.max(target - eaten, 0);

  return (
    <View className="px-6 mt-6 mb-8">
      {/* Calories Massive Typography */}
      <View>
        <Text className="text-slate-500 font-bold mb-1">Năng lượng hôm nay</Text>
        <View className="flex-row items-baseline gap-2 mt-1">
          <Text className="text-slate-700 text-[64px] font-black tracking-tighter" style={{ lineHeight: 74 }}>{Math.round(eaten).toLocaleString()}</Text>
          <Text className="text-slate-400 text-2xl font-bold">kcal</Text>
        </View>

        {/* Progress Bar */}
        <View className="mt-6">
          <View className="flex-row justify-between text-xs font-bold mb-2">
            <Text className="text-slate-400">Đã nạp {Math.round(percent)}%</Text>
            <Text className="text-slate-400">Còn lại {Math.round(left).toLocaleString()} kcal</Text>
          </View>
          <View className="h-4 w-full bg-slate-100 rounded-full relative p-0.5 shadow-inner">
            <View className="h-full bg-[#10B981] rounded-full relative" style={{ width: `${percent}%` }}>
              <View className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-sm border-2 border-emerald-500" />
            </View>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View className="mt-8 flex-row gap-3">
        {/* CARBS */}
        <View className="bg-white flex-1 rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Carbs</Text>
            <View className="w-6 h-6 rounded-full bg-emerald-50 items-center justify-center">
              <Feather name="pie-chart" size={12} color="#10B981" />
            </View>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-700 font-black text-xl">{Math.round(dailyLog?.carbs || 0)}</Text>
            <Text className="text-slate-400 font-bold text-[10px]">/{Math.round(tCarb)}g</Text>
          </View>
        </View>

        {/* PROTEIN */}
        <View className="bg-white flex-1 rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Protein</Text>
            <View className="w-6 h-6 rounded-full bg-orange-50 items-center justify-center">
              <MaterialCommunityIcons name="food-steak" size={12} color="#F97316" />
            </View>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-700 font-black text-xl">{Math.round(dailyLog?.protein || 0)}</Text>
            <Text className="text-slate-400 font-bold text-[10px]">/{Math.round(tProt)}g</Text>
          </View>
        </View>

        {/* FAT */}
        <View className="bg-white flex-1 rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Fat</Text>
            <View className="w-6 h-6 rounded-full bg-blue-50 items-center justify-center">
              <MaterialCommunityIcons name="water" size={12} color="#3B82F6" />
            </View>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-700 font-black text-xl">{Math.round(dailyLog?.fat || 0)}</Text>
            <Text className="text-slate-400 font-bold text-[10px]">/{Math.round(tFat)}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
// ------------------------------

// --- MAIN SCREEN ---
export default function SuperAppHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dailyLog, setDailyLog] = useState({
    eaten: 0, carbs: 0, protein: 0, fat: 0,
    meals: { breakfast: { calories: 0 }, lunch: { calories: 0 }, dinner: { calories: 0 }, snack: { calories: 0 } } as any
  });

  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [popularFoods, setPopularFoods] = useState<Food[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://10.0.2.2:3000';

  const fetchMetrics = async () => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const [metricsData, logsData, profile] = await Promise.all([
        userService.getCalculatedMetrics(),
        foodService.getDailyLog(dateStr),
        userService.getProfile()
      ]);

      setMetrics(metricsData);
      setUserProfile(profile);

      const newLog: any = { eaten: 0, carbs: 0, protein: 0, fat: 0, meals: { breakfast: { calories: 0 }, lunch: { calories: 0 }, dinner: { calories: 0 }, snack: { calories: 0 } } };
      if (Array.isArray(logsData)) {
        logsData.forEach((log: any) => {
          const type = log.meal_type;
          if (newLog.meals[type]) { newLog.meals[type].calories += (log.calories || 0); }
          newLog.eaten += (log.calories || 0); newLog.carbs += (log.carb || 0); newLog.protein += (log.protein || 0); newLog.fat += (log.fat || 0);
        });
      }
      setDailyLog(newLog);
    } catch (e) { console.log(e); }
  };

  const fetchSuggestedFoods = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await foodService.search({ limit: 3 });
      setSuggestedFoods(res.data || []);
    } catch (error) {
      console.error('Failed to load suggested foods', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchPopularFoods = async () => {
    try {
      setLoadingPopular(true);
      // Lấy trang 2 để có món khác với Gợi ý hôm nay
      const res = await foodService.search({ limit: 6, page: 2, sort: 'calories', order: 'DESC' });
      setPopularFoods(res.data || []);
    } catch (error) {
      console.error('Failed to load popular foods', error);
    } finally {
      setLoadingPopular(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchMetrics();
    fetchSuggestedFoods();
    fetchPopularFoods();
  }, []));

  useEffect(() => {
    const refreshSub = DeviceEventEmitter.addListener('refreshFoodLogs', () => { fetchMetrics(); });
    return () => { refreshSub.remove(); };
  }, [fetchMetrics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMetrics(),
      fetchSuggestedFoods(),
      fetchPopularFoods()
    ]);
    setRefreshing(false);
  };

  const target = metrics?.target_calories || 2000;
  const tCarb = metrics?.target_carb_g || 250;
  const tProt = metrics?.target_protein_g || 150;
  const tFat = metrics?.target_fat_g || 65;

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#10B98120', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 800 }}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {/* KHỐI 1 + 2: GREETING & AVATAR MIX (Nhỏ Gọn Lên Top) */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="px-6 mb-2">
          {/* Header Mới: Avatar (Trái) + Search Bar (Phải) */}
          <View className="flex-row justify-between items-center mb-4">
            {/* Avatar User */}
            <TouchableOpacity onPress={() => router.push('/profile')} className="w-14 h-14 rounded-full overflow-hidden shadow-sm shadow-slate-200 border-2 border-white bg-slate-100 mr-3">
              <Image source={{ uri: userProfile?.avatar || 'https://ui-avatars.com/api/?background=10B981&color=fff' }} className="w-full h-full object-cover" />
            </TouchableOpacity>

            {/* Trỏ thanh Tìm Kiếm tới Trang food-search có sẵn */}
            <TouchableOpacity
              onPress={() => router.push('/food/food-search')}
              className="flex-1 h-14 bg-white/30 rounded-full flex-row items-center px-4 shadow-sm shadow-slate-200 border border-slate-100"
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={20} color="#94A3B8" />
              <Text className="text-slate-500 ml-2 font-medium">Bạn muốn ăn gì?</Text>
            </TouchableOpacity>
          </View>

          {/* TITLE Bự Riêng Biệt Phía Dưới */}
          {/* <Text className="text-4xl font-black text-slate-700 mt-4 leading-[40px] tracking-tight">
            Ăn gì hôm nay để khỏe mạnh mỗi ngày?
          </Text> */}

        </Animated.View>

        {/* KHỐI 3: HERO CALORIES SIÊU BỰ NHƯ THIẾT KẾ #1 */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-5 mt-4 mb-8">
          <View>
            <Text className="text-slate-500 font-bold mb-1">Năng lượng hôm nay</Text>
            <View className="flex-row items-baseline gap-2 mt-1">
              <Text className="text-slate-700 text-[64px] font-bold tracking-tighter" style={{ lineHeight: 74 }}>{Math.round(dailyLog.eaten).toLocaleString()}</Text>
              <Text className="text-slate-500 text-3xl font-bold">kcal</Text>
            </View>

            {/* Progress Bar */}
            <View className="mt-6">
              <View className="flex-row justify-between text-xs font-bold mb-2">
                <Text className="text-slate-500">Đã nạp {Math.round(Math.min((dailyLog.eaten / target) * 100, 100) || 0)}%</Text>
                <Text className="text-slate-500">Còn lại {Math.round(Math.max(target - dailyLog.eaten, 0)).toLocaleString()} kcal</Text>
              </View>
              <View className="h-4 w-full bg-slate-100 rounded-full relative p-0.5 shadow-inner">
                <View className="h-full bg-[#10B981] rounded-full relative" style={{ width: `${Math.min((dailyLog.eaten / target) * 100, 100) || 0}%` }}>
                  <View className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-sm border-2 border-emerald-500" />
                </View>
              </View>
            </View>
          </View>

          {/* Summary Cards */}
          <View className="mt-8 flex-row gap-3">
            {/* CARBS */}
            <View className="bg-white flex-1 rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-slate-700 text-base font-bold">Tinh bột</Text>
                <View className="w-8 h-8 rounded-2xl items-end justify-center">
                  <Wheat size={18} color="#22C55E" />
                </View>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-slate-700 font-black text-xl">{Math.round(dailyLog?.carbs || 0)}</Text>
                <Text className="text-slate-500 font-bold text-base">/{Math.round(tCarb)}g</Text>
              </View>
            </View>

            {/* PROTEIN (Đạm) */}
            <View className="bg-white flex-1 rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-slate-700 text-base font-bold">Đạm</Text>
                <View className="w-8 h-8 rounded-2xl items-center justify-center">
                  <Beef size={18} color="#3B82F6" />
                </View>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-slate-700 font-black text-xl">{Math.round(dailyLog?.protein || 0)}</Text>
                <Text className="text-slate-500 font-bold text-base">/{Math.round(tProt)}g</Text>
              </View>
            </View>

            {/* FAT (Béo) */}
            <View className="bg-white flex-1 rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-slate-700 text-base font-bold">Chất Béo</Text>
                <View className="w-8 h-8 rounded-2xl items-center justify-center">
                  <Droplet size={18} color="#EAB308" />
                </View>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-slate-700 font-black text-xl">{Math.round(dailyLog?.fat || 0)}</Text>
                <Text className="text-slate-500 font-bold text-base">/{Math.round(tFat)}g</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* KHỐI 4: MENU 4 MÓN 1 HÀNG */}
        <Animated.View entering={FadeInDown.delay(400).springify()} className="px-4 mb-6">
          <View className="flex-row justify-between items-start">
            <TouchableOpacity onPress={() => router.push('/calendar')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[15px] bg-green-100 items-center justify-center mb-1.5 shadow-sm shadow-emerald-200">
                <Ionicons name="calendar" size={26} color="#047857" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Nhật Ký</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/foods')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[15px] bg-orange-100 items-center justify-center mb-1.5 shadow-sm shadow-orange-200">
                <MaterialCommunityIcons name="food-fork-drink" size={26} color="#C2410C" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Món Ăn</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/ai-plan' as any)} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[15px] bg-pink-100 items-center justify-center mb-1.5 shadow-sm shadow-pink-200 relative">
                <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                <Ionicons name="sparkles" size={26} color="#BE123C" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Gợi Ý AI</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/progress')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[15px] bg-sky-100 items-center justify-center mb-1.5 shadow-sm shadow-sky-200">
                <Ionicons name="stats-chart" size={26} color="#0369A1" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Thống Kê</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[15px] bg-slate-100 items-center justify-center mb-1.5 shadow-sm shadow-slate-300">
                <Ionicons name="person" size={26} color="#334155" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Tài Khoản</Text>
            </TouchableOpacity> */}
          </View>
        </Animated.View>

        {/* KHỐI 5: SUGGESTED CARDS (Ngang - y hình ảnh 3D) */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <View className="px-6 flex-row justify-between items-end mb-4 mt-2">
            <Text className="text-xl font-black text-slate-800 tracking-tight">Gợi ý hôm nay</Text>
            <TouchableOpacity onPress={() => router.push('/foods')} className="flex-row items-center py-1 px-3 rounded-full shadow-sm shadow-slate-100">
              <Text className="text-slate-600 font-bold text-sm mr-1">Xem tất cả</Text>
              <Feather name="arrow-right" size={12} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {loadingSuggestions ? (
            <View className="h-[200px] items-center justify-center">
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12, height: 170, paddingHorizontal: 20, marginBottom: 16 }}>

              {/* Card LỚN - style ai-plan: ImageBackground + dark gradient */}
              {suggestedFoods[0] && (
                <TouchableOpacity
                  onPress={() => router.push(`/food/food-detail?id=${suggestedFoods[0].id}`)}
                  activeOpacity={0.9}
                  style={{ flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: '#CBD5E1' }}
                >
                  {suggestedFoods[0].image ? (
                    <ImageBackground source={{ uri: `${IMAGE_BASE_URL}${suggestedFoods[0].image}` }} style={{ flex: 1 }} resizeMode="cover">
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={{ flex: 1, justifyContent: 'flex-end', padding: 12 }}>
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 14, lineHeight: 18, marginBottom: 4 }} numberOfLines={2}>{suggestedFoods[0].name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <Flame size={12} color="#EA580C" />
                          <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>{Math.round(suggestedFoods[0].calories)} <Text style={{ fontSize: 10, fontWeight: '700' }}>kcal</Text></Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Wheat size={10} color="#10B981" />
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>{Math.round(suggestedFoods[0].carb)}g</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Beef size={10} color="#3B82F6" />
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>{Math.round(suggestedFoods[0].protein)}g</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Droplet size={10} color="#EAB308" />
                            <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>{Math.round(suggestedFoods[0].fat)}g</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  ) : (
                    <LinearGradient colors={['#E2E8F0', '#CBD5E1']} style={{ flex: 1, justifyContent: 'flex-end', padding: 12 }}>
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#94A3B8" />
                      </View>
                      <Text style={{ color: '#1e293b', fontWeight: '900', fontSize: 14, lineHeight: 18, marginBottom: 4 }} numberOfLines={2}>{suggestedFoods[0].name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Flame size={12} color="#EA580C" />
                        <Text style={{ color: '#EA580C', fontWeight: '900', fontSize: 13 }}>{Math.round(suggestedFoods[0].calories)} <Text style={{ fontSize: 10, fontWeight: '700' }}>kcal</Text></Text>
                      </View>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              )}

              {/* 2 Card nhỏ - style ai-plan side items */}
              <View style={{ width: '42%', gap: 12 }}>
                {suggestedFoods.slice(1, 3).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/food/food-detail?id=${item.id}`)}
                    activeOpacity={0.9}
                    style={{ flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 10, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' }}
                  >
                    <View style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.image ? (
                        <Image source={{ uri: `${IMAGE_BASE_URL}${item.image}` }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                      ) : (
                        <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#CBD5E1" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-slate-700 font-bold text-xs leading-4 mb-1" numberOfLines={2}>{item.name}</Text>
                      <View className="flex-row items-center gap-1">
                        <Flame size={10} color="#EA580C" />
                        <Text className="text-orange-600 font-black" style={{ fontSize: 10 }}>{Math.round(item.calories)} kcal</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        {/* KHỐI 6: ĐƯỢC NHIỀU NGƯỜI CHỌN */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="mb-6">
          <View className="px-5 flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-xl font-black text-slate-800 tracking-tight">Được nhiều người chọn</Text>
              <Text className="text-slate-400 text-xs font-medium mt-0.5">Các món ăn phổ biến nhất</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/foods')} className="flex-row items-center gap-1 bg-slate-100 py-1.5 px-3 rounded-full">
              <Text className="text-slate-600 font-bold text-xs">Xem tất cả</Text>
              <Feather name="arrow-right" size={11} color="#475569" />
            </TouchableOpacity>
          </View>

          {loadingPopular ? (
            <View className="h-[120px] items-center justify-center">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {popularFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  onPress={() => router.push(`/food/food-detail?id=${food.id}`)}
                  activeOpacity={0.9}
                  style={{ width: 130, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
                >
                  {/* Ảnh */}
                  <View style={{ width: '100%', height: 90, backgroundColor: '#f8fafc' }}>
                    {food.image ? (
                      <Image source={{ uri: `${IMAGE_BASE_URL}${food.image}` }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="food-apple" size={28} color="#CBD5E1" />
                      </View>
                    )}
                  </View>
                  {/* Text */}
                  <View style={{ padding: 8 }}>
                    <Text className="text-slate-700 font-bold text-xs leading-4 mb-1" numberOfLines={2}>{food.name}</Text>
                    <View className="flex-row items-center gap-1">
                      <Flame size={10} color="#EA580C" />
                      <Text className="text-orange-600 font-black" style={{ fontSize: 10 }}>{Math.round(food.calories)} kcal</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </ScrollView>

      {/* KHỐI 6: FLOATING BOTTOM SEARCH BAR (Trắng, Trong suốt viền hồng) */}
      <View className="absolute bottom-6 w-full px-6 items-center pointer-events-box-none z-10">
        <TouchableOpacity
          onPress={() => router.push('/foods')}
          activeOpacity={0.9}
          className="w-full h-16 bg-white/95 backdrop-blur-3xl rounded-[28px] flex-row items-center justify-between px-5 border border-white/40 shadow-xl shadow-rose-200/50"
          style={{ elevation: 12 }}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full border border-slate-100 items-center justify-center shadow-sm shadow-slate-200 bg-white">
              <Image source={require('../../assets/images/google-logo.png')} style={{ width: 16, height: 16, tintColor: '#F43F5E', opacity: 0.8 }} />
            </View>
            <Text className="text-slate-400 font-medium text-[15px]">What do you want?</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View >
  );
}
