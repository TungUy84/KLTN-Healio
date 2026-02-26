import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Image, Modal, ActivityIndicator, Alert, DeviceEventEmitter, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Wheat, Beef, Droplet } from 'lucide-react-native';
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

  // AI Meal Planner State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanSuggestion | null>(null);

  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

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
      const res = await foodService.search({ limit: 5 }); // Lấy 5 món ngẫu nhiên hoặc mới nhất
      setSuggestedFoods(res.data || []);
    } catch (error) {
      console.error('Failed to load suggested foods', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchMetrics();
    fetchSuggestedFoods(); // Tải gợi ý thức ăn một lần khi mount
  }, []));

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('triggerAISuggestion', () => { handleSuggestMeal(); });
    return () => subscription.remove();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMetrics(),
      fetchSuggestedFoods()
    ]);
    setRefreshing(false);
  };

  const target = metrics?.target_calories || 2000;
  const tCarb = metrics?.target_carb_g || 250;
  const tProt = metrics?.target_protein_g || 150;
  const tFat = metrics?.target_fat_g || 65;

  const handleSuggestMeal = async () => {
    setAiLoading(true);
    setShowAiModal(true);
    try {
      const plan = await aiService.suggestMealPlan();
      setMealPlan(plan);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tạo thực đơn lúc này.');
      setShowAiModal(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyMealPlan = async () => {
    if (!mealPlan) return;
    setAiLoading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const meals = [
        { ...mealPlan.breakfast, type: 'breakfast' },
        { ...mealPlan.lunch, type: 'lunch' },
        { ...mealPlan.dinner, type: 'dinner' }
      ];

      for (const meal of meals) {
        await foodService.addToDiary({
          food_id: meal.food_id,
          meal_type: meal.type,
          quantity: meal.amount, // API expects 'quantity'
          unit_name: meal.detail?.serving_unit || 'suất',
          date: dateStr
        });
      }

      Alert.alert('Thành công', 'Đã lưu thực đơn vào nhật ký!');
      setShowAiModal(false);
      fetchMetrics(); // Reload data
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Có lỗi khi lưu thực đơn.');
    } finally {
      setAiLoading(false);
    }
  };

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
          <Text className="text-4xl font-black text-slate-700 mt-4 leading-[40px] tracking-tight">
            Ăn gì hôm nay để khỏe mạnh mỗi ngày?
          </Text>

        </Animated.View>

        {/* KHỐI 3: HERO CALORIES SIÊU BỰ NHƯ THIẾT KẾ #1 */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 mt-4 mb-8">
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
                <View className="w-8 h-8 rounded-2xl items-center justify-center">
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

        {/* KHỐI 4: MENU 5 MÓN 1 HÀNG */}
        <Animated.View entering={FadeInDown.delay(400).springify()} className="px-4 mb-12">
          <View className="flex-row justify-between items-start">
            <TouchableOpacity onPress={() => router.push('/calendar')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[24px] bg-green-100 items-center justify-center mb-1.5 shadow-sm shadow-emerald-200">
                <Ionicons name="calendar" size={26} color="#047857" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Nhật Ký</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/foods')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[24px] bg-orange-100 items-center justify-center mb-1.5 shadow-sm shadow-orange-200">
                <MaterialCommunityIcons name="food-fork-drink" size={26} color="#C2410C" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Món Ăn</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSuggestMeal} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[24px] bg-pink-100 items-center justify-center mb-1.5 shadow-sm shadow-pink-200 relative">
                <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                <Ionicons name="sparkles" size={26} color="#BE123C" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Gợi Ý AI</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/progress')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[24px] bg-sky-100 items-center justify-center mb-1.5 shadow-sm shadow-sky-200">
                <Ionicons name="stats-chart" size={26} color="#0369A1" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Thống Kê</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7} className="items-center w-[18%]">
              <View className="w-[56px] h-[56px] rounded-[24px] bg-slate-100 items-center justify-center mb-1.5 shadow-sm shadow-slate-300">
                <Ionicons name="person" size={26} color="#334155" />
              </View>
              <Text className="text-slate-700 font-bold text-[10.5px] text-center" numberOfLines={1}>Tài Khoản</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* KHỐI 5: SUGGESTED CARDS (Ngang - y hình ảnh 3D) */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <View className="px-6 flex-row justify-between items-end mb-4 mt-2">
            <Text className="text-xl font-black text-slate-800 tracking-tight">Gợi ý hôm nay</Text>
            <TouchableOpacity onPress={() => router.push('/foods')} className="flex-row items-center border border-slate-200 py-1 px-3 rounded-full bg-slate-50 shadow-sm shadow-slate-100">
              <Text className="text-slate-600 font-bold text-[11px] mr-1">Xem tất cả</Text>
              <Feather name="arrow-right" size={12} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {loadingSuggestions ? (
            <View className="h-[220px] flex justify-center items-center">
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width * 0.85 + 16} // Chiều rộng thẻ + margin
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            >
              {suggestedFoods.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  className="mr-5 bg-white rounded-[32px] overflow-hidden shadow-sm shadow-slate-200 border border-slate-100 mb-bottom 16"
                  style={{ width: width * 0.85 }}
                  onPress={() => {
                    // Navigate to future food detail or quick add modal
                  }}
                >
                  <View className="flex-col h-full w-full">
                    {/* Ảnh bự nằm CỤC BỘ Ở TRÊN (Hero Image) */}
                    <View className="w-full h-[180px] bg-slate-50 relative items-center justify-center">
                      {item.image ? (
                        <Image source={{ uri: `${IMAGE_BASE_URL}${item.image}` }} className="w-full h-full object-cover" />
                      ) : (
                        <MaterialCommunityIcons name="silverware-fork-knife" size={48} color="#CBD5E1" />
                      )}

                      {/* Dấu trang/Favorite (Tùy chọn tương lai) */}
                      <View className="absolute top-4 right-4 w-9 h-9 bg-white/50 backdrop-blur-md rounded-full items-center justify-center">
                        <Ionicons name="heart-outline" size={20} color="#1E293B" />
                      </View>
                    </View>

                    {/* Nội dung bên dưới */}
                    <View className="p-5">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-slate-800 font-black text-lg flex-1 mr-2 leading-6" numberOfLines={2}>
                          {item.name}
                        </Text>

                        {/* Calo Badge đặt sang bên phải */}
                        <View className="bg-orange-50 px-2 py-1 rounded-lg flex-row items-center border border-orange-100">
                          <MaterialCommunityIcons name="fire" size={14} color="#EA580C" />
                          <Text className="text-orange-700 font-bold text-xs ml-1">{Math.round(item.calories)} <Text className="text-[10px] font-medium">kcal</Text></Text>
                        </View>
                      </View>

                      {/* Thông tin mô tả ngắn */}
                      {item.cooking ? (
                        <Text className="text-slate-500 text-sm mb-4 leading-5" numberOfLines={2}>{item.cooking}</Text>
                      ) : (
                        <Text className="text-slate-500 text-sm mb-4 italic">Món ngon mỗi ngày - Gợi ý từ Healio</Text>
                      )}

                      {/* Macros rành mạch */}
                      <View className="flex-row items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <View className="flex-col items-center flex-1">
                          <Text className="text-slate-400 font-medium text-[10px] uppercase tracking-wide mb-1">Tinh bột</Text>
                          <Text className="text-green-600 font-bold text-sm">{Math.round(item.carb)}g</Text>
                        </View>

                        <View className="w-[1px] h-full bg-slate-200" />

                        <View className="flex-col items-center flex-1">
                          <Text className="text-slate-400 font-medium text-[10px] uppercase tracking-wide mb-1">Đạm</Text>
                          <Text className="text-blue-600 font-bold text-sm">{Math.round(item.protein)}g</Text>
                        </View>

                        <View className="w-[1px] h-full bg-slate-200" />

                        <View className="flex-col items-center flex-1">
                          <Text className="text-slate-400 font-medium text-[10px] uppercase tracking-wide mb-1">Chất béo</Text>
                          <Text className="text-yellow-600 font-bold text-sm">{Math.round(item.fat)}g</Text>
                        </View>
                      </View>
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

      {/* AI Meal Plan Modal (Giữ phần Content Cũ) */}
      <Modal visible={showAiModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] h-[85%] overflow-hidden">
            <View className="p-5 border-b border-slate-100 flex-row justify-between items-center bg-white z-10">
              <View>
                <Text className="text-xl font-black text-slate-700 tracking-tight">Thực đơn AI</Text>
                <Text className="text-xs text-slate-500 font-medium mt-0.5">Một ngày lành mạnh năng lượng</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAiModal(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            {aiLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="mt-4 text-slate-500 font-medium text-sm animate-pulse">Đang phân tích dữ liệu kho món...</Text>
              </View>
            ) : mealPlan ? (
              <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {/* Summary */}

                {/* Meals */}
                <View className="gap-4">
                  {[
                    { title: 'Sữa Sáng', data: mealPlan.breakfast, icon: 'food-croissant', iconColor: '#F97316', color: 'bg-orange-50 border-orange-100' },
                    { title: 'Bữa Trưa', data: mealPlan.lunch, icon: 'silverware-fork-knife', iconColor: '#3B82F6', color: 'bg-blue-50 border-blue-100' },
                    { title: 'Bữa Tối', data: mealPlan.dinner, icon: 'pot-steam-outline', iconColor: '#6366F1', color: 'bg-indigo-50 border-indigo-100' }
                  ].map((meal, index) => (
                    <View key={index} className={`p-4 rounded-3xl border ${meal.color}`}>
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-row gap-2 items-center">
                          <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm shadow-slate-200">
                            <MaterialCommunityIcons name={meal.icon as any} size={16} color={meal.iconColor} />
                          </View>
                          <Text className="font-extrabold text-slate-700 text-sm tracking-wide uppercase">{meal.title}</Text>
                        </View>
                        <View className="bg-white px-2 py-1 rounded border border-white shadow-sm">
                          <Text className="text-slate-600 font-bold text-[11px]">{meal.data.amount} {meal.data.detail?.serving_unit || 'suất'}</Text>
                        </View>
                      </View>
                      <Text className="text-slate-700 font-black text-lg mb-1">{meal.data.detail?.name || 'Món ăn gợi ý'}</Text>
                      <Text className="text-slate-500 text-xs italic mb-4">"{meal.data.reason}"</Text>
                      <View className="flex-row gap-2">
                        <View className="bg-white px-2 py-1.5 rounded-lg border border-slate-100 flex-row items-center gap-1 shadow-sm shadow-slate-100">
                          <Ionicons name="flame" size={12} color="#F97316" />
                          <Text className="text-[11px] text-slate-700 font-bold">{Math.round((meal.data.detail?.calories || 0) * meal.data.amount)} kcal</Text>
                        </View>
                        <View className="bg-white px-2 py-1.5 rounded-lg border border-slate-100 flex-row items-center gap-1 shadow-sm shadow-slate-100">
                          <MaterialCommunityIcons name="food-steak" size={12} color="#3B82F6" />
                          <Text className="text-[11px] text-slate-700 font-bold">{Math.round((meal.data.detail?.protein || 0) * meal.data.amount)}g Pro</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <View className="h-32" />
              </ScrollView>
            ) : null}

            {/* Bottom Button */}
            {!aiLoading && mealPlan && (
              <View className="px-5 pb-8 pt-4 border-t border-slate-100 bg-white absolute bottom-0 left-0 right-0">
                <TouchableOpacity onPress={handleApplyMealPlan} className="bg-[#10B981] h-[52px] rounded-full flex-row justify-center items-center shadow-lg shadow-emerald-500/30">
                  <Text className="text-white font-black text-[15px] tracking-wide mr-2">Áp Dụng Thực Đơn Này</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
