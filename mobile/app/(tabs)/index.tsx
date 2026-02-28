import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Image, ImageBackground, Modal, ActivityIndicator, Alert, DeviceEventEmitter, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Wheat, Beef, Droplet, Flame } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, interpolate, useAnimatedScrollHandler, Extrapolation } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop, Path } from 'react-native-svg';
import { userService, CalculatedMetrics } from '../../services/userService';
import { foodService, Food } from '../../services/foodService';

const { width } = Dimensions.get('window');

// --- COMPONENTS CŨ PHỤC HỒI ---
const AnimatedView = Animated.createAnimatedComponent(View);

// Component Gauge Arc 270° bằng react-native-svg (gap ở dưới, hiện đại)
const CalorieGauge = ({ value, target }: { value: number; target: number }) => {
  const SIZE = 122;
  const STROKE = 13;
  const r = (SIZE - STROKE) / 2; // bán kính
  const cx = SIZE / 2; // tâm x
  const cy = SIZE / 2; // tâm y
  const pct = Math.min(Math.max((value / (target || 1)) * 100, 0), 100);
  const TOTAL = 235;  // tổng cung 235°
  const START = 360 - TOTAL / 2; // tự động cân đối quanh 12 o'clock

  // Chuyển độ sang toạ độ SVG
  const pt = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Tạo SVG path cho cung tròn
  const arc = (from: number, to: number) => {
    if (to - from <= 0) return '';
    const s = pt(from);
    const e = pt(to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  };

  const bgArc = arc(START, START + TOTAL);
  const progressDeg = (pct / 100) * TOTAL;
  const fgArc = arc(START, START + progressDeg);
  // Màu dựa theo % (xanh lá nếu đầy đủ, cam nếu vừa, hồng nếu thiếu)
  const fgColor = pct >= 90 ? '#10B981' : pct >= 60 ? '#fb923c' : '#fb7185';

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        {/* Vòng nền xám */}
        <Path d={bgArc} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} strokeLinecap="round" />
        {/* Vòng tiến độ */}
        {fgArc ? <Path d={fgArc} fill="none" stroke={fgColor} strokeWidth={STROKE} strokeLinecap="round" /> : null}
      </Svg>
      {/* Text trung tâm */}
      <View style={{ alignItems: 'center', marginTop: -8 }}>
        <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', lineHeight: 30 }}>{Math.round(value)}</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: fgColor, lineHeight: 15 }}>{Math.round(pct)}%</Text>
      </View>
    </View>
  );
};

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

  // --- ANIMATED HEADER SETUP ---
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const fadeBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 50], [0, 1], Extrapolation.CLAMP),
    };
  });

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const size = interpolate(scrollY.value, [0, 40], [56, 0], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 30], [1, 0], Extrapolation.CLAMP);
    const margin = interpolate(scrollY.value, [0, 40], [12, 0], Extrapolation.CLAMP);
    return {
      width: size,
      height: size,
      opacity,
      marginRight: margin,
    };
  });
  // ------------------------------

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
  const popularScrollRef = useRef<ScrollView>(null);
  const CARD_WIDTH = width * 0.82;
  const GAP = 16;
  const SNAP_INTERVAL = CARD_WIDTH + GAP;

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
      const data = await foodService.getPopularFoods(6);
      setPopularFoods(data || []);
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Ánh sáng mờ tỏa ra từ các góc (Ambient Glow) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <SvgRadialGradient id="grad1" cx="0%" cy="0%" rx="60%" ry="60%" fx="0%" fy="0%">
              <Stop offset="0%" stopColor="#0D9488" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="grad2" cx="100%" cy="25%" rx="50%" ry="50%" fx="100%" fy="25%">
              <Stop offset="0%" stopColor="#14B8A6" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="grad3" cx="0%" cy="60%" rx="50%" ry="50%" fx="0%" fy="60%">
              <Stop offset="0%" stopColor="#0F766E" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
        </Svg>
      </View>

      {/* STICKY ANIMATED HEADER - Sương Mù (Fade Out Effect) */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 12, paddingHorizontal: 24, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>

        {/* Lớp sương mù (Gradient) che phủ nội dung cuộn để chúng "từ từ biến mất" vào nền trắng */}
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: -30 }, fadeBackgroundStyle]} pointerEvents="none">
          <LinearGradient colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']} style={{ flex: 1 }} />
        </Animated.View>

        <View className="flex-row justify-between items-center">
          {/* Avatar User (Sẽ biến mất khi cuộn) */}
          <Animated.View style={[avatarAnimatedStyle, { borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'white', backgroundColor: '#F1F5F9' }]}>
            <TouchableOpacity onPress={() => router.push('/profile')} className="w-full h-full">
              <Image source={{ uri: userProfile?.avatar || 'https://ui-avatars.com/api/?background=10B981&color=fff' }} className="w-full h-full object-cover" />
            </TouchableOpacity>
          </Animated.View>

          {/* Search Bar (Sẽ dãn ra full width khi Avatar biến mất) */}
          <TouchableOpacity
            onPress={() => router.push('/food/food-search')}
            className="flex-1 h-14 bg-white/40 rounded-full flex-row items-center px-4 shadow-sm shadow-slate-200 border border-white/50"
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="#94A3B8" />
            <Text className="text-slate-500 ml-2 font-medium">Bạn muốn ăn gì?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 84, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" progressViewOffset={insets.top + 60} />}
      >
        {/* KHỐI 1 + 2: GREETING (Đã di chuyển Avatar lên header) */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="px-6 mb-2">

          {/* TITLE Bự Riêng Biệt Phía Dưới */}
          {/* <Text className="text-4xl font-black text-slate-700 mt-4 leading-[40px] tracking-tight">
            Ăn gì hôm nay để khỏe mạnh mỗi ngày?
          </Text> */}

        </Animated.View>

        {/* KHỐI 3: HERO CALORIES SIÊU BỰ NHƯ THIẾT KẾ #1 */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mb-4 mt-2">
          {/* === Macro Banner style giống ai-plan nhưng bg transparent  === */}
          <View className="py-2">
            <Text className="text-xl font-black text-slate-800 tracking-tight mb-6">Năng lượng {"&"} Dinh dưỡng</Text>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>

              {/* Trái: Gauge Calo 270° */}
              <View style={{ width: '40%', alignItems: 'center', top: 10, justifyContent: 'center' }}>
                <CalorieGauge value={dailyLog.eaten} target={target} />
              </View>

              {/* Separator dọc */}
              <View style={{ width: 1, height: '90%', backgroundColor: '#e2e8f0', opacity: 0.6 }} />

              {/* Phải: 3 thanh Macro */}
              <View className="flex-1" style={{ gap: 12 }}>
                {/* Đạm */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Beef size={11} color="#3B82F6" />
                      <Text className="text-slate-500 text-xs font-semibold">Đạm</Text>
                    </View>
                    <Text className="text-slate-700 font-black text-xs">
                      {Math.round(dailyLog.protein)}<Text className="text-slate-400 font-medium"> /{Math.round(tProt)}g</Text>
                    </Text>
                  </View>
                  <View className="bg-slate-100 rounded-full overflow-hidden" style={{ height: 6 }}>
                    <View className="bg-blue-400 rounded-full" style={{ height: 6, width: `${Math.min((dailyLog.protein / (tProt || 1)) * 100, 100)}%` }} />
                  </View>
                </View>
                {/* Tinh bột */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Wheat size={11} color="#10B981" />
                      <Text className="text-slate-500 text-xs font-semibold">Tinh bột</Text>
                    </View>
                    <Text className="text-slate-700 font-black text-xs">
                      {Math.round(dailyLog.carbs)}<Text className="text-slate-400 font-medium"> /{Math.round(tCarb)}g</Text>
                    </Text>
                  </View>
                  <View className="bg-slate-100 rounded-full overflow-hidden" style={{ height: 6 }}>
                    <View className="bg-emerald-400 rounded-full" style={{ height: 6, width: `${Math.min((dailyLog.carbs / (tCarb || 1)) * 100, 100)}%` }} />
                  </View>
                </View>
                {/* Chất béo */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Droplet size={11} color="#EAB308" />
                      <Text className="text-slate-500 text-xs font-semibold">Chất béo</Text>
                    </View>
                    <Text className="text-slate-700 font-black text-xs">
                      {Math.round(dailyLog.fat)}<Text className="text-slate-400 font-medium"> /{Math.round(tFat)}g</Text>
                    </Text>
                  </View>
                  <View className="bg-slate-100 rounded-full overflow-hidden" style={{ height: 6 }}>
                    <View className="bg-yellow-400 rounded-full" style={{ height: 6, width: `${Math.min((dailyLog.fat / (tFat || 1)) * 100, 100)}%` }} />
                  </View>
                </View>
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
            <Text className="text-xl font-black text-slate-800 tracking-tight">Được nhiều người chọn</Text>
            <TouchableOpacity onPress={() => router.push('/foods')} className="flex-row items-center py-1 px-3 rounded-full shadow-sm shadow-slate-100">
              <Text className="text-slate-600 font-bold text-sm mr-1">Xem tất cả</Text>
              <Feather name="arrow-right" size={12} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {loadingPopular ? (
            <View className="h-[220px] items-center justify-center">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : (
            <ScrollView
              ref={popularScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              contentContainerStyle={{
                paddingHorizontal: (width - CARD_WIDTH) / 2
              }}
              onLayout={() => {
                if (popularScrollRef.current && popularFoods.length > 0) {
                  const offset = popularFoods.length * SNAP_INTERVAL;
                  popularScrollRef.current.scrollTo({ x: offset, animated: false });
                }
              }}
              onScroll={(e) => {
                if (!popularFoods.length) return;
                const offsetX = e.nativeEvent.contentOffset.x;
                const arrWidth = popularFoods.length * SNAP_INTERVAL;

                // Nếu lướt tới mảng 3 (giới hạn phải) -> nhảy về mảng 2
                if (offsetX >= arrWidth * 2) {
                  popularScrollRef.current?.scrollTo({ x: offsetX - arrWidth, animated: false });
                }
                // Nếu lướt lùi chạm mảng 1 (giới hạn trái) -> nhảy tiến mảng 2
                else if (offsetX <= 0) {
                  popularScrollRef.current?.scrollTo({ x: offsetX + arrWidth, animated: false });
                }
              }}
              scrollEventThrottle={16}
            >
              {[...popularFoods, ...popularFoods, ...popularFoods].map((food, index) => {
                const originalIndex = index % popularFoods.length;
                const rank = originalIndex + 1;

                return (
                  <TouchableOpacity
                    key={`${food.id}-${index}`}
                    onPress={() => router.push(`/food/food-detail?id=${food.id}`)}
                    activeOpacity={0.92}
                    style={{ width: CARD_WIDTH, height: 220, borderRadius: 28, overflow: 'hidden', backgroundColor: '#1e293b', marginRight: GAP }}
                  >
                    {/* Ảnh nền full card */}
                    {food.image ? (
                      <ImageBackground
                        source={{ uri: `${IMAGE_BASE_URL}${food.image}` }}
                        style={{ flex: 1 }}
                        resizeMode="cover"
                      >
                        {/* Gradient tối từ dưới lên */}
                        <LinearGradient
                          colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
                          style={{ flex: 1, justifyContent: 'space-between', padding: 14 }}
                        >
                          {/* Top Headers: Rank & Usage Count */}
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                            {/* Badge Số lần chọn */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.52)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                              <MaterialCommunityIcons name="silverware-variant" size={11} color="white" />
                              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{food.usage_count || 0}</Text>
                            </View>
                          </View>

                          {/* Bottom: Tên + macro */}
                          <View>
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, lineHeight: 24, marginBottom: 8 }} numberOfLines={2}>{food.name}</Text>
                            {/* Calo + macro row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                                <Flame size={13} color="#fb923c" />
                                <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>{Math.round(food.calories)} <Text style={{ fontSize: 10, fontWeight: '600' }}>kcal</Text></Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Wheat size={11} color="#10B981" />
                                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' }}>{Math.round(food.carb)}g</Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Beef size={11} color="#60a5fa" />
                                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' }}>{Math.round(food.protein)}g</Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Droplet size={11} color="#fbbf24" />
                                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700' }}>{Math.round(food.fat)}g</Text>
                              </View>
                            </View>
                          </View>
                        </LinearGradient>
                      </ImageBackground>
                    ) : (
                      <LinearGradient colors={['#334155', '#1e293b']} style={{ flex: 1, justifyContent: 'space-between', padding: 14 }}>
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                          <MaterialCommunityIcons name="silverware-fork-knife" size={64} color="rgba(255,255,255,0.1)" />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, width: '100%' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.55)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                            <MaterialCommunityIcons name="silverware-variant" size={11} color="white" />
                            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{food.usage_count || 0}</Text>
                          </View>
                        </View>
                        <View>
                          <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, lineHeight: 24, marginBottom: 8 }} numberOfLines={2}>{food.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                            <Flame size={13} color="#fb923c" />
                            <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>{Math.round(food.calories)} <Text style={{ fontSize: 10, fontWeight: '600' }}>kcal</Text></Text>
                          </View>
                        </View>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </View >
  );
}
