import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Image, Dimensions, Modal, ActivityIndicator, Alert, DeviceEventEmitter } from 'react-native';
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

// 1. Modern Glass Header & Calendar
const GlassHeader = ({ userProfile, selectedDate, onPrevDate, onNextDate, onDatePress, handleSuggestMeal }: any) => {
  const insets = useSafeAreaInsets();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 14) return 'Chào buổi trưa';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getDays = () => {
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <View style={{ paddingTop: insets.top + 10 }} className="px-6 pb-2 z-20">
      {/* Top Row */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
            <Image
              source={{ uri: userProfile?.avatar || 'https://ui-avatars.com/api/?background=10B981&color=fff' }}
              className="w-full h-full object-cover"
            />
          </View>
          <View>
            <Text className="text-white/80 text-xs font-medium">{getGreeting()}</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-white font-bold text-lg">{userProfile?.full_name?.split(' ')[userProfile?.full_name?.split(' ').length - 1] || 'Bạn'}</Text>
              <Ionicons name="hand-right" size={18} color="#FBBF24" />
            </View>
          </View>
        </View>

        <TouchableOpacity className="w-10 h-10 rounded-full border border-white/40 items-center justify-center active:bg-white/10">
          <Feather name="bell" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar Strip */}
      <View className="flex-row justify-between items-center px-2">
        {getDays().map((date, idx) => {
          const isSelected = idx === 2; // Center date
          return (
            <TouchableOpacity
              key={idx}
              onPress={idx < 2 ? onPrevDate : idx > 2 ? onNextDate : onDatePress}
              className={`w-[50px] h-[76px] rounded-full items-center justify-center ${isSelected ? 'bg-white shadow-lg shadow-teal-900/20' : 'bg-white/20'}`}
              style={!isSelected ? { backgroundColor: 'rgba(255,255,255,0.2)' } : undefined} // Force glass effect
            >
              <Text className={`text-xs mb-1 ${isSelected ? 'text-slate-500 font-medium' : 'text-white/80'}`}>{dayNames[date.getDay()]}</Text>
              <Text className={`text-lg ${isSelected ? 'text-slate-900 font-bold' : 'text-white font-semibold'}`}>{date.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// 2. Calories Hero & Summary Cards
const CaloriesHero = ({ target, eaten, dailyLog, tCarb, tProt, tFat }: any) => {
  const percent = Math.min((eaten / target) * 100, 100) || 0;
  const left = Math.max(target - eaten, 0);

  return (
    <View className="px-6 mt-8">
      {/* Calories Massive Typography */}
      <View>
        <Text className="text-white/80 text-sm font-medium">Hôm nay</Text>
        <View className="flex-row items-baseline gap-2 mt-1">
          <Text className="text-white text-7xl font-light tracking-tight">{Math.round(eaten).toLocaleString()}</Text>
          <Text className="text-white/80 text-2xl font-light">kcal</Text>
        </View>

        {/* Progress Bar */}
        <View className="mt-8">
          <View className="flex-row justify-between text-xs font-medium mb-2">
            <Text className="text-white/70">Còn lại</Text>
            <Text className="text-white/70">{Math.round(left).toLocaleString()} kcal</Text>
          </View>
          <View className="h-4 w-full bg-white/20 rounded-full relative p-0.5">
            <View className="h-full bg-[#F59E0B] rounded-full relative" style={{ width: `${percent}%` }}>
              <View className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-orange-400" />
            </View>
          </View>
        </View>
      </View>

      {/* Summary Cards (Goal, Food, Exercise - Adapted to Macros for health app) */}
      <View className="mt-8 flex-row gap-3">
        <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Carbs</Text>
            <View className="w-6 h-6 rounded-full bg-emerald-50 items-center justify-center">
              <Feather name="pie-chart" size={12} color="#10B981" />
            </View>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-800 font-bold text-base">{Math.round(dailyLog?.carbs || 0)}</Text>
            <Text className="text-slate-400 text-[10px]">/{Math.round(tCarb)}g</Text>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Protein</Text>
            <View className="w-6 h-6 rounded-full bg-orange-50 items-center justify-center">
              <MaterialCommunityIcons name="food-steak" size={12} color="#F97316" />
            </View>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-800 font-bold text-base">{Math.round(dailyLog?.protein || 0)}</Text>
            <Text className="text-slate-400 text-[10px]">/{Math.round(tProt)}g</Text>
          </View>
        </View>

        <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Fat</Text>
            <View className="w-6 h-6 rounded-full bg-blue-50 items-center justify-center">
              <MaterialCommunityIcons name="water" size={14} color="#3B82F6" />
            </View>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-slate-800 font-bold text-base">{Math.round(dailyLog?.fat || 0)}</Text>
            <Text className="text-slate-400 text-[10px]">/{Math.round(tFat)}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

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

// 4. Next Habit / Meal Grid
const MealItem = ({ title, calories, icon, checkDelay, onPress, colorTheme }: any) => {
  let iconBg = 'bg-slate-100';
  let iconColor = 'text-slate-500';

  if (colorTheme?.includes('orange')) { iconBg = 'bg-orange-100'; iconColor = '#F97316'; }
  else if (colorTheme?.includes('blue')) { iconBg = 'bg-blue-100'; iconColor = '#3B82F6'; }
  else if (colorTheme?.includes('indigo')) { iconBg = 'bg-indigo-100'; iconColor = '#6366F1'; }
  else if (colorTheme?.includes('rose')) { iconBg = 'bg-rose-100'; iconColor = '#F43F5E'; }

  return (
    <AnimatedView entering={FadeInDown.delay(checkDelay).duration(500)} className="w-[48%] mb-4">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="bg-white rounded-3xl p-5 shadow-sm active:scale-[0.98]"
      >
        <View className={`w-12 h-12 rounded-full ${iconBg} bg-opacity-30 flex items-center justify-center mb-4`}>
          <Image source={{ uri: icon }} className="w-6 h-6" style={{ tintColor: iconColor }} resizeMode="contain" />
        </View>
        <Text className="font-bold text-slate-900 text-lg">{title}</Text>
        <View className="mt-2 space-y-0.5">
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons name="fire" size={14} color="#94A3B8" />
            <Text className="text-slate-400 text-xs">{calories} kcal</Text>
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

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('triggerAISuggestion', () => {
      handleSuggestMeal();
    });
    return () => subscription.remove();
  }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchMetrics(); setRefreshing(false); };

  const target = metrics?.target_calories || 2000;
  const tCarb = metrics?.target_carb_g || 250;
  const tProt = metrics?.target_protein_g || 150;
  const tFat = metrics?.target_fat_g || 65;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#059669', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 800 }}
      />

      {/* 1. Glass Header */}
      <GlassHeader
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={'#ffffff'} />}
        showsVerticalScrollIndicator={false}
      >

        {/* 2. Hero & Cards */}
        <CaloriesHero
          target={target} eaten={dailyLog.eaten}
          dailyLog={dailyLog} tCarb={tCarb} tProt={tProt} tFat={tFat}
        />

        {/* 3. Next Habit (Meals Grid) */}
        <View className="px-6 mt-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-800 font-bold text-lg">Nhật ký hôm nay</Text>
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