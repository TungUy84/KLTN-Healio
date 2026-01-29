import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Image, Dimensions, Modal, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { userService, CalculatedMetrics } from '../../services/userService';
import { foodService } from '../../services/foodService';
import { aiService, MealPlanSuggestion } from '../../services/aiService';

// --- COMPONENTS ---
const AnimatedView = Animated.createAnimatedComponent(View);
const { width } = Dimensions.get('window');

// 1. Modern Header
const Header = ({ userProfile, selectedDate, onPrevDate, onNextDate, onDatePress, handleSuggestMeal }: any) => {
  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 14) return 'Chào buổi trưa';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const greeting = getGreeting();
  const titleName = userProfile?.full_name;
  const avatarUri = userProfile?.avatar;

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    return `${date.getDate()} thg ${date.getMonth() + 1}`;
  };

  return (
    <View style={{ paddingTop: insets.top + 10 }} className="px-6 pb-4 bg-white z-20">
      {/* Top Row */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center gap-3">
          <View className="p-0.5 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-full shadow-sm">
            <Image
              source={{ uri: avatarUri }}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
          </View>
          <View>
            <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-0.5">{greeting}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-slate-800 font-bold text-xl">{titleName} 👋</Text>
              <TouchableOpacity onPress={handleSuggestMeal} className="bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex-row items-center gap-1 active:bg-indigo-100">
                <Ionicons name="sparkles" size={12} color="#6366F1" />
                <Text className="text-indigo-600 text-[10px] font-bold">Gợi ý AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity className="w-11 h-11 bg-slate-50 rounded-full items-center justify-center border border-slate-100 shadow-sm active:bg-slate-100">
          <Feather name="bell" size={22} color="#64748B" />
          {/* Notification Dot */}
          <View className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        </TouchableOpacity>
      </View>

      {/* Date Navigator - Capsule Style */}
      <View className="flex-row items-center justify-between bg-slate-50 p-1.5 rounded-full border border-slate-100/80">
        <TouchableOpacity onPress={onPrevDate} className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-50 active:scale-95">
          <Feather name="chevron-left" size={20} color="#64748B" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDatePress} className="flex-1 h-10 flex-row items-center justify-center gap-2 active:opacity-60">
          <Feather name="calendar" size={16} color="#0D9488" />
          <Text className="text-slate-700 font-bold text-base">{formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNextDate} className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-50 active:scale-95">
          <Feather name="chevron-right" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 2. Premium Liquid Hero Card (Redesigned)
const LiquidHero = ({ target, eaten, dailyLog, tCarb, tProt, tFat }: any) => {
  const percent = Math.min(Math.max(eaten / (target || 2000), 0), 1.5); // Allow overflow for color logic
  const waveAnim = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    waveAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    progress.value = withTiming(percent, { duration: 1000 });
  }, [percent]);

  const animatedStyle = useAnimatedStyle(() => {
    const heightPercent = Math.min(progress.value, 1.1) * 100; // Cap visual height at 110%
    return {
      height: `${heightPercent}%`,
      backgroundColor: interpolateColor(
        progress.value,
        [0, 0.8, 1, 1.1], // Orange -> Green -> Green -> Red
        ['#F97316', '#10B981', '#10B981', '#EF4444']
      )
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1, 1.1],
        ['#F97316', '#0F766E', '#DC2626'] // Match button to liquid theme
      )
    };
  });

  return (
    <AnimatedView entering={FadeInUp.delay(100).springify()} className="px-5 mt-4">
      {/* Container Chính */}
      <View className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/60 border border-slate-50 overflow-hidden relative">

        {/* Decorative Background Blur */}
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-teal-50 rounded-full blur-3xl opacity-50" />
        <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50" />

        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Mục tiêu hôm nay</Text>
            <Text className="text-slate-800 text-2xl font-bold">{target} <Text className="text-sm font-medium text-slate-400">kcal</Text></Text>
          </View>
          <View className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            <Text className="text-slate-600 font-bold text-xs">{Math.round(percent * 100)}%</Text>
          </View>
        </View>

        {/* Main Circle Container */}
        <View className="items-center justify-center py-2 mb-6">
          <View className="w-56 h-56 rounded-full border-[8px] border-slate-50 shadow-inner bg-white overflow-hidden relative justify-center items-center">
            {/* Background Circle */}
            <View className="absolute inset-0 bg-slate-50/50" />

            {/* The Liquid */}
            <Animated.View className="absolute bottom-0 left-0 right-0 opacity-90 w-full z-10" style={animatedStyle}>
              <View className="w-full h-4 bg-white/20 absolute top-0" />
            </Animated.View>

            {/* Content Inside Water */}
            <View className="z-20 items-center justify-center">
              <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1 shadow-sm opacity-80">Đã nạp</Text>
              <Text className="text-slate-800 font-bold text-5xl tracking-tighter shadow-sm">{Math.round(eaten)}</Text>
              <Text className="text-slate-500 font-medium text-xs mt-1 shadow-sm">kcal</Text>
            </View>
          </View>

          {/* Quick Add Button Floating - Color Sync */}
          <AnimatedView className="absolute -bottom-4 px-5 py-2.5 rounded-full flex-row items-center shadow-lg shadow-gray-400/30 active:scale-95 z-30 border-4 border-white" style={buttonAnimatedStyle}>
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white font-bold text-xs ml-2">Nạp nhanh</Text>
          </AnimatedView>
        </View>

        {/* Macros Bars - Clean Style */}
        <View className="mt-4 gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
          <DetailedMacroBar label="Carbs" value={dailyLog.carbs} max={tCarb} color="#10b981" />
          <DetailedMacroBar label="Protein" value={dailyLog.protein} max={tProt} color="#f97316" />
          <DetailedMacroBar label="Fat" value={dailyLog.fat} max={tFat} color="#3b82f6" />
        </View>
      </View>
    </AnimatedView>
  )
}

const DetailedMacroBar = ({ label, value, max, color }: any) => {
  const p = Math.min((value / max) * 100, 100);
  return (
    <View className="flex-row items-center gap-3">
      <View className="w-16">
        <Text className="text-slate-500 font-bold text-[11px] uppercase">{label}</Text>
      </View>
      <View className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <View style={{ width: `${p}%`, backgroundColor: color }} className="h-full rounded-full" />
      </View>
      <View className="w-16 items-end">
        <Text className="text-slate-700 font-bold text-xs">{Math.round(value)}<Text className="text-slate-400 text-[10px]">/{max}g</Text></Text>
      </View>
    </View>
  )
}

// 3. Metrics Section - Sync with Result Screen (Centered & Styled)
const MetricSection = ({ metrics }: any) => {
  const getBMIInfo = (bmi: number) => {
    if (!bmi) return { label: '--', color: 'text-slate-400', bg: 'bg-slate-100' };
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (bmi < 23) return { label: 'Bình thường', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (bmi < 25) return { label: 'Thừa cân', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Béo phì', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const bmiInfo = getBMIInfo(metrics?.bmi);

  return (
    <View className="px-5 mt-6 flex-row gap-3">
      {/* BMI Card */}
      <AnimatedView entering={FadeInDown.delay(200).springify()} style={{ flex: 1 }} className="bg-white py-4 px-2 rounded-3xl border border-slate-100 shadow-sm items-center">
        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-2">
          <Ionicons name="body" size={18} color="#3B82F6" />
        </View>
        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">BMI</Text>
        <Text className="text-slate-800 font-bold text-xl mb-1">{metrics?.bmi || '--'}</Text>
        <View className={`px-2 py-0.5 rounded-full ${bmiInfo.bg}`}>
          <Text className={`text-[9px] font-bold ${bmiInfo.color}`}>{bmiInfo.label}</Text>
        </View>
      </AnimatedView>

      {/* BMR Card */}
      <AnimatedView entering={FadeInDown.delay(300).springify()} style={{ flex: 1.2 }} className="bg-white py-4 px-2 rounded-3xl border border-slate-100 shadow-sm items-center">
        <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mb-2">
          <Ionicons name="flame" size={18} color="#F97316" />
        </View>
        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">BMR</Text>
        <Text className="text-slate-800 font-bold text-xl mb-1">{Math.round(metrics?.bmr) || 0}</Text>
        <Text className="text-slate-400 text-[9px] font-medium">Kcal/ngày</Text>
      </AnimatedView>

      {/* TDEE Card */}
      <AnimatedView entering={FadeInDown.delay(400).springify()} style={{ flex: 1.2 }} className="bg-white py-4 px-2 rounded-3xl border border-slate-100 shadow-sm items-center">
        <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mb-2">
          <Ionicons name="flash" size={18} color="#A855F7" />
        </View>
        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">TDEE</Text>
        <Text className="text-slate-800 font-bold text-xl mb-1">{Math.round(metrics?.tdee) || 0}</Text>
        <Text className="text-slate-400 text-[9px] font-medium">Kcal/ngày</Text>
      </AnimatedView>
    </View>
  )
}

// 4. Meal Grid - Colorful & Vibrancy
const MealItem = ({ title, calories, icon, checkDelay, onPress, colorTheme }: any) => {
  // Extract base color from Tailwind class (simplified mapping)
  let bgSoft = 'bg-slate-50';
  let border = 'border-slate-100';

  if (colorTheme?.includes('orange')) { bgSoft = 'bg-orange-50'; border = 'border-orange-100'; }
  else if (colorTheme?.includes('blue')) { bgSoft = 'bg-blue-50'; border = 'border-blue-100'; }
  else if (colorTheme?.includes('indigo')) { bgSoft = 'bg-indigo-50'; border = 'border-indigo-100'; }
  else if (colorTheme?.includes('rose')) { bgSoft = 'bg-rose-50'; border = 'border-rose-100'; }

  return (
    <AnimatedView entering={FadeInDown.delay(checkDelay).duration(500)} className="w-[48%] mb-4">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`rounded-[28px] p-5 border ${border} ${bgSoft} shadow-sm relative overflow-hidden h-36 justify-between active:scale-[0.98]`}
      >
        {/* Decorative Blob */}
        <View className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 bg-white`} />

        <View className="flex-row justify-between items-start">
          <View className={`w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm`}>
            <Image source={{ uri: icon }} className="w-7 h-7" resizeMode="contain" />
          </View>
          <View className="w-8 h-8 rounded-full bg-white/60 items-center justify-center">
            <Feather name="plus" size={18} color="#64748B" />
          </View>
        </View>

        <View>
          <Text className="text-slate-800 font-bold text-lg leading-tight mb-1">{title}</Text>
          <View className="bg-white/80 self-start px-2.5 py-1 rounded-lg overflow-hidden">
            <Text className="text-slate-600 font-bold text-xs">
              {calories} <Text className="text-[10px] font-normal text-slate-400">kcal</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedView>
  )
}

// --- MAIN SCREEN ---
export default function DiaryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
      const dateStr = selectedDate.toISOString().split('T')[0];
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

  const fetchMetrics = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
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

  useFocusEffect(useCallback(() => { fetchMetrics(); }, [selectedDate]));
  const onRefresh = async () => { setRefreshing(true); await fetchMetrics(); setRefreshing(false); };

  const target = metrics?.target_calories || 2000;
  const tCarb = metrics?.target_carb_g || 250;
  const tProt = metrics?.target_protein_g || 150;
  const tFat = metrics?.target_fat_g || 65;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Background Gradient Mesh (Optional - Adds subtle depth) */}
      <LinearGradient
        colors={['#F0FDFA', '#F8FAFC', '#F8FAFC']}
        className="absolute top-0 left-0 right-0 h-96"
      />

      {/* 1. Header */}
      <Header
        userProfile={userProfile}
        selectedDate={selectedDate}
        onPrevDate={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }}
        onNextDate={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }}
        onDatePress={() => setShowDatePicker(true)}
        handleSuggestMeal={handleSuggestMeal}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={'#0D9488'} />}
        showsVerticalScrollIndicator={false}
      >

        {/* 2. Liquid Hero & Macros */}
        <LiquidHero
          target={target} eaten={dailyLog.eaten}
          dailyLog={dailyLog} tCarb={tCarb} tProt={tProt} tFat={tFat}
        />

        {/* 3. Reordered Metrics */}
        <MetricSection metrics={metrics} />

        {/* 4. Compact Meal List */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-5 px-1">
            <View>
              <Text className="text-slate-800 font-extrabold text-xl">Nhật ký hôm nay</Text>
            </View>
            <TouchableOpacity className="bg-slate-100 p-2 rounded-full">
              <MaterialCommunityIcons name="dots-horizontal" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <MealItem
              title="Bữa Sáng" calories={Math.round(dailyLog.meals.breakfast.calories)}
              icon="https://cdn-icons-png.flaticon.com/512/887/887359.png" checkDelay={500} colorTheme="bg-orange-400"
              onPress={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'breakfast' } })}
            />
            <MealItem
              title="Bữa Trưa" calories={Math.round(dailyLog.meals.lunch.calories)}
              icon="https://cdn-icons-png.flaticon.com/512/2921/2921822.png" checkDelay={600} colorTheme="bg-blue-400"
              onPress={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'lunch' } })}
            />
            <MealItem
              title="Bữa Tối" calories={Math.round(dailyLog.meals.dinner.calories)}
              icon="https://cdn-icons-png.flaticon.com/512/706/706164.png" checkDelay={700} colorTheme="bg-indigo-400"
              onPress={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'dinner' } })}
            />
            <MealItem
              title="Bữa Phụ" calories={Math.round(dailyLog.meals.snack.calories)}
              icon="https://cdn-icons-png.flaticon.com/512/2515/2515183.png" checkDelay={800} colorTheme="bg-rose-400"
              onPress={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'snack' } })}
            />
          </View>
        </View>

      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }}
        />
      )}

          {/* AI Meal Plan Modal */}
          <Modal visible={showAiModal} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-[32px] h-[85%] overflow-hidden">
                <View className="p-5 border-b border-slate-100 flex-row justify-between items-center bg-white z-10">
                  <View>
                    <Text className="text-xl font-bold text-slate-800">Thực đơn AI 🤖</Text>
                    <Text className="text-xs text-slate-400 font-medium">Được thiết kế riêng cho bạn</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowAiModal(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                    <Feather name="x" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {aiLoading ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0D9488" />
                    <Text className="mt-4 text-slate-500 font-medium text-sm animate-pulse">Đang phân tích dinh dưỡng...</Text>
                  </View>
                ) : mealPlan ? (
                  <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                    {/* Summary Card */}
                    <View className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6 flex-row justify-between items-center">
                      <View>
                        <Text className="text-emerald-800 font-bold text-lg">Tổng Calo dự kiến</Text>
                        <Text className="text-emerald-600 text-xs">Phù hợp mục tiêu của bạn</Text>
                      </View>
                      <View className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                        <Text className="text-emerald-700 font-bold text-xl">{mealPlan.total_calories} <Text className="text-xs">kcal</Text></Text>
                      </View>
                    </View>

                    {/* Meals */}
                    <View className="gap-4">
                      {[
                        { title: 'Sữa Sáng', data: mealPlan.breakfast, icon: '☀️', color: 'bg-orange-50 border-orange-100' },
                        { title: 'Bữa Trưa', data: mealPlan.lunch, icon: '🌤️', color: 'bg-blue-50 border-blue-100' },
                        { title: 'Bữa Tối', data: mealPlan.dinner, icon: '🌙', color: 'bg-indigo-50 border-indigo-100' }
                      ].map((meal, index) => (
                        <View key={index} className={`p-4 rounded-2xl border ${meal.color}`}>
                          <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-row gap-2 items-center">
                              <Text className="text-xl">{meal.icon}</Text>
                              <Text className="font-bold text-slate-700 text-base">{meal.title}</Text>
                            </View>
                            <View className="bg-white/60 px-2 py-1 rounded text-xs">
                              <Text className="text-slate-500 font-bold text-xs">{meal.data.amount} {meal.data.detail?.serving_unit || 'suất'}</Text>
                            </View>
                          </View>

                          <Text className="text-slate-800 font-bold text-lg mb-1">{meal.data.detail?.name || 'Món ăn gợi ý'}</Text>
                          <Text className="text-slate-500 text-xs italic mb-3">"{meal.data.reason}"</Text>

                          {/* Mini Macros */}
                          <View className="flex-row gap-2">
                            <View className="bg-white px-2 py-1 rounded border border-slate-100">
                              <Text className="text-[10px] text-slate-500 font-bold">🔥 {Math.round((meal.data.detail?.calories || 0) * meal.data.amount)} kcal</Text>
                            </View>
                            <View className="bg-white px-2 py-1 rounded border border-slate-100">
                              <Text className="text-[10px] text-slate-500 font-bold">🥩 {Math.round((meal.data.detail?.protein || 0) * meal.data.amount)}g Pro</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View className="h-24" />
                  </ScrollView>
                ) : null}

                {/* Bottom Button */}
                {!aiLoading && mealPlan && (
                  <View className="p-5 border-t border-slate-100 bg-white absolute bottom-0 left-0 right-0">
                    <TouchableOpacity onPress={handleApplyMealPlan} className="bg-black py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-slate-300">
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">Áp dụng ngay</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </View>
        );
}