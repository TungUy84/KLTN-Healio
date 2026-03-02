import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity, Dimensions,
  StatusBar, RefreshControl, ActivityIndicator, Platform, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Beef, Wheat, Droplet } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import Animated, {
  FadeInDown, FadeInUp, ZoomIn,
  useSharedValue, useAnimatedStyle, interpolate, Extrapolation, useAnimatedScrollHandler
} from 'react-native-reanimated';
import {
  getDashboardStats, DashboardStats,
  getNutritionStats, NutritionStats,
  getBodyStats, BodyStats,
  getFoodInsights, FoodInsights
} from '../../services/statsService';
import { BlurView } from 'expo-blur';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// --- AMBIENT GLOW BACKGROUND (Sky Blue) ---
const AmbientGlowBackground = () => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
    <Svg height="100%" width="100%">
      <Defs>
        <SvgRadialGradient id="s1" cx="80%" cy="0%" rx="70%" ry="60%">
          <Stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
        </SvgRadialGradient>
        <SvgRadialGradient id="s2" cx="0%" cy="35%" rx="55%" ry="55%">
          <Stop offset="0%" stopColor="#0369A1" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
        </SvgRadialGradient>
        <SvgRadialGradient id="s3" cx="100%" cy="75%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </SvgRadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#s1)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#s2)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#s3)" />
    </Svg>
  </View>
);

const resolveImg = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_URL.replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

// --- PERIOD OPTIONS (dùng chung cho tất cả section) ---
const PERIODS = [
  { id: '7d', label: 'Theo tuần' },
  { id: '30d', label: 'Theo tháng' },
  { id: '1y', label: 'Theo năm' },
];

// --- PERIOD PILLS (kiểu Foods – horizontal scroll) ---
const PeriodPills = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
    className="mb-5"
  >
    {PERIODS.map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => onChange(item.id)}
        className={`mr-3 px-5 py-3 rounded-full border shadow-sm ${value === item.id
          ? 'bg-white border-white shadow-slate-200'
          : 'bg-white/40 border-white/40 shadow-transparent'
          }`}
      >
        <Text
          className={`text-[15px] font-bold ${value === item.id ? 'text-slate-800' : 'text-slate-500'
            }`}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);


export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [nutrition, setNutrition] = useState<NutritionStats | null>(null);
  const [bodyStats, setBodyStats] = useState<BodyStats | null>(null);
  const [foodInsights, setFoodInsights] = useState<FoodInsights | null>(null);

  // Dùng chung 1 period state cho tất cả sections
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animated header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });
  const headerBlurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 60], [0, 1], Extrapolation.CLAMP)
  }));

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [dashboardData, nutritionData, bodyData, foodData] = await Promise.all([
        getDashboardStats(),
        getNutritionStats(period),
        getBodyStats(period),
        getFoodInsights(period),
      ]);
      setStats(dashboardData);
      setNutrition(nutritionData);
      setBodyStats(bodyData);
      setFoodInsights(foodData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchAllStats(); }, [period]));

  // Helper: gộp raw daily data theo period rồi tính trung bình
  const aggregateByPeriod = useCallback((
    raw: { date: string; calories: number }[]
  ): { label: string; avg: number }[] => {
    if (!raw || raw.length === 0) return [];

    if (period === '7d') {
      // Mỗi ngày 1 cột, nhãn: dd/mm
      return raw.map(item => {
        const d = new Date(item.date);
        return { label: `${d.getDate()}/${d.getMonth() + 1}`, avg: item.calories };
      });
    }

    // Nhóm: key theo tuần (30d) hoặc tháng (6m / 1y)
    const grouped: Record<string, { sum: number; count: number; label: string }> = {};

    raw.forEach(item => {
      const d = new Date(item.date);
      let key: string;
      let label: string;

      if (period === '30d') {
        // Tính số tuần trong tháng (0-based)
        const weekOfMonth = Math.floor((d.getDate() - 1) / 7);
        key = `${d.getFullYear()}-${d.getMonth()}-W${weekOfMonth}`;
        const weekStart = weekOfMonth * 7 + 1;
        label = `${weekStart}/${d.getMonth() + 1}`;
      } else {
        // 6m / 1y → nhóm theo tháng
        key = `${d.getFullYear()}-${d.getMonth()}`;
        label = `T${d.getMonth() + 1}`;
      }

      if (!grouped[key]) grouped[key] = { sum: 0, count: 0, label };
      grouped[key].sum += item.calories;
      grouped[key].count += 1;
    });

    return Object.values(grouped).map(g => ({ label: g.label, avg: Math.round(g.sum / g.count) }));
  }, [period]);

  // Chart data
  const nutritionBarData = useMemo(() => {
    if (!nutrition) return [];
    const targetCals = nutrition.target.calories;
    const aggregated = aggregateByPeriod(nutrition.timeline || []);
    return aggregated.map(item => ({
      value: item.avg,
      label: item.label,
      frontColor: item.avg > targetCals ? '#F87171' : '#10B981',
      gradientColor: item.avg > targetCals ? '#FCA5A5' : '#6EE7B7',
    }));
  }, [nutrition, period, aggregateByPeriod]);

  const nutritionPieData = useMemo(() => {
    if (!nutrition) return [{ value: 1, color: '#E2E8F0' }];
    const total = nutrition.macroSplit.carb + nutrition.macroSplit.protein + nutrition.macroSplit.fat;
    if (total <= 0) return [{ value: 1, color: '#E2E8F0' }];
    return [
      { value: nutrition.macroSplit.protein, color: '#3B82F6' }, // Đạm – Blue
      { value: nutrition.macroSplit.carb, color: '#10B981' },    // Tinh bột – Emerald
      { value: nutrition.macroSplit.fat, color: '#EAB308' },     // Chất béo – Yellow
    ];
  }, [nutrition]);

  const lineData = useMemo(() => {
    if (!bodyStats) return [];
    // Line chart: hiển thị raw data với nhãn dựa theo period
    let data = bodyStats.history.map((item) => {
      const d = new Date(item.date);
      let lbl = '';
      if (period === '7d') lbl = `${d.getDate()}/${d.getMonth() + 1}`;
      else if (period === '30d') lbl = d.getDate() % 7 === 1 ? `${d.getDate()}/${d.getMonth() + 1}` : '';
      else lbl = `T${d.getMonth() + 1}`;
      return { value: parseFloat(item.weight as any), label: lbl };
    });
    if (data.length === 1) data = [{ value: data[0].value, label: '' } as any, data[0]];
    return data;
  }, [bodyStats, period]);

  const MEAL_META: Record<string, { color: string; icon: string; label: string }> = {
    breakfast: { color: '#3B82F6', icon: 'weather-sunset-up', label: 'Sáng' },
    lunch: { color: '#F59E0B', icon: 'white-balance-sunny', label: 'Trưa' },
    dinner: { color: '#8B5CF6', icon: 'weather-night', label: 'Tối' },
    snack: { color: '#10B981', icon: 'cookie', label: 'Phụ' },
    // fallback tiếng Việt phòng khi API đổi format
    'Sáng': { color: '#3B82F6', icon: 'weather-sunset-up', label: 'Sáng' },
    'Trưa': { color: '#F59E0B', icon: 'white-balance-sunny', label: 'Trưa' },
    'Tối': { color: '#8B5CF6', icon: 'weather-night', label: 'Tối' },
    'Phụ': { color: '#10B981', icon: 'cookie', label: 'Phụ' },
  };

  const foodPieData = useMemo(() => {
    if (!foodInsights) return [];
    const totalCals = foodInsights.mealDistribution.reduce((sum, item) => sum + item.calories, 0);
    return foodInsights.mealDistribution.map((item) => ({
      value: item.calories,
      text: `${Math.round((item.calories / Math.max(1, totalCals)) * 100)}%`,
      color: MEAL_META[item.meal]?.color || '#94A3B8',
      label: item.meal,
    }));
  }, [foodInsights]);

  const foodBarData = useMemo(() => {
    if (!foodInsights) return [];
    const aggregated = aggregateByPeriod(foodInsights.consistency || []);
    return aggregated.map(item => ({
      value: item.avg,
      label: item.label,
      frontColor: item.avg > 2000 ? '#F87171' : '#34D399',
      gradientColor: item.avg > 2000 ? '#FCA5A5' : '#6EE7B7',
    }));
  }, [foodInsights, period, aggregateByPeriod]);

  // Helper card wrapper
  const CardWrap = ({ children, delay = 0, color = '#0EA5E9', icon, title, subtitle }: any) => (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className="mb-6"
      style={{
        backgroundColor: 'rgba(255,255,255,0.78)',
        borderRadius: 36,
        paddingHorizontal: 22,
        paddingVertical: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.7)',
        shadowColor: color,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center mb-5">
        <Animated.View entering={ZoomIn.delay(delay + 200).springify()} className="w-12 h-12 rounded-[20px] items-center justify-center mr-4" style={{ backgroundColor: `${color}18` }}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </Animated.View>
        <View className="flex-1">
          <Text className="text-[19px] font-[900] text-slate-800 tracking-tighter">{title}</Text>
          {subtitle ? <Text className="text-xs text-slate-400 font-bold mt-0.5">{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientGlowBackground />

      {/* Static Header (Foods style) – có Period filter */}
      <BlurView tint="light" intensity={90} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top + 16, paddingBottom: 16, backgroundColor: 'rgba(255,255,255,0.2)' }}>
        {/* Hàng 1: Back + Title + Streak */}
        <View className="flex-row justify-between items-center px-5 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200"
          >
            <Feather name="arrow-left" size={20} color="#334155" />
          </TouchableOpacity>

          <Text className="text-[22px] font-black text-slate-800 tracking-tight">Thống Kê</Text>

          <Animated.View entering={ZoomIn.delay(300).springify()} className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full ">
            <MaterialCommunityIcons name="fire" size={20} color="#F59E0B" />
            <Text className="text-amber-600 text-[20px] font-black">{stats?.streak || 0}</Text>
          </Animated.View>
        </View>

        {/* Hàng 2: Period filter – FlatList kiểu foods */}
        <View className="px-5">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={PERIODS}
            keyExtractor={(i: { id: string; label: string }) => i.id}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }: { item: { id: string; label: string } }) => (
              <TouchableOpacity
                onPress={() => setPeriod(item.id)}
                className={`mr-3 px-5 py-3.5 rounded-full border shadow-sm ${period === item.id
                  ? 'bg-white border-white shadow-slate-200'
                  : 'bg-white/40 border-white/40 shadow-transparent'
                  }`}
              >
                <Text className={`text-[15px] font-bold ${period === item.id ? 'text-slate-800' : 'text-slate-500'
                  }`}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </BlurView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 130, paddingBottom: 140, paddingHorizontal: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllStats(); }} tintColor="#10B981" />}
      >


        {loading && (
          <View className="py-6 items-center">
            <ActivityIndicator size="small" color="#10B981" />
          </View>
        )}



        {/* ── XU HƯỚNG ĂN UỐNG ── */}
        <View className="mb-5 mt-4">
          <Text className="text-[22px] font-black text-slate-800 tracking-tight">Xu hướng ăn uống</Text>
        </View>

        {/* Nutrition Card – không có title trong card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">


          <Text className="text-xs text-slate-400 font-bold mb-3">Mục tiêu: {nutrition?.target.calories || 0} kcal/ngày</Text>

          {nutritionBarData.length > 0 ? (() => {
            const barW = 18;
            const chartW = width - 40; // padding 20*2
            const n = nutritionBarData.length;
            const spacing = Math.max(10, Math.floor((chartW - n * barW - 20) / Math.max(1, n)));
            return (
              <BarChart
                data={nutritionBarData}
                barWidth={barW}
                spacing={spacing}
                width={chartW}
                roundedTop hideRules yAxisThickness={0} xAxisThickness={1}
                xAxisColor="#E2E8F0" hideYAxisText showGradient
                xAxisLabelTextStyle={{ fontSize: 10, color: '#94A3B8', fontWeight: 'bold' }}
                showReferenceLine1 referenceLine1Position={nutrition?.target.calories || 0}
                referenceLine1Config={{ color: '#94A3B8', dashWidth: 4, dashGap: 4, thickness: 1 }}
                height={150} initialSpacing={10} endSpacing={10}
              />
            );
          })() : (
            <View className="py-8 items-center"><Text className="text-slate-400 font-bold">Chưa có dữ liệu calories</Text></View>
          )}

          {/* Macro Legend – icon và màu theo trang chủ */}
          <View className="flex-row items-center pt-4 border-t border-slate-50">
            <PieChart data={nutritionPieData} donut radius={56} innerRadius={35} showText textColor="white" textSize={10} textBackgroundRadius={12} />
            <View className="flex-1 ml-6 gap-y-4">
              {[
                { label: 'Đạm', val: nutrition?.macroSplit.protein || 0, color: '#3B82F6', Icon: Beef },
                { label: 'Tinh bột', val: nutrition?.macroSplit.carb || 0, color: '#10B981', Icon: Wheat },
                { label: 'Chất béo', val: nutrition?.macroSplit.fat || 0, color: '#EAB308', Icon: Droplet },
              ].map(m => (
                <View key={m.label} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <m.Icon size={11} color={m.color} />
                    <Text className="text-xs font-semibold text-slate-500">{m.label}</Text>
                  </View>
                  <Text className="text-xs font-black text-slate-700">{m.val}g</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── CƠ THỂ ── */}
        <View className="mb-5 mt-2">
          <Text className="text-[22px] font-black text-slate-800 tracking-tight">Cân nặng</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(280).springify()} className="mb-6">

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-slate-400">Hiện tại: <Text className="text-slate-800 font-black">{bodyStats?.currentWeight || 0} kg</Text></Text>
            <Text className="text-sm font-black text-emerald-500">Mục tiêu: {bodyStats?.goalWeight || 0} kg</Text>
          </View>

          {lineData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <LineChart
                data={lineData}
                color="#10B981" thickness={3}
                dataPointsColor="#059669"
                startFillColor="#10B981" endFillColor="#10B981"
                startOpacity={0.2} endOpacity={0.01}
                areaChart curved hideRules hideYAxisText
                yAxisColor="transparent" xAxisColor="#E2E8F0" xAxisThickness={1}
                xAxisLabelTextStyle={{ fontSize: 9, color: '#94A3B8' }}
                height={160}
                spacing={Math.max(45, Math.floor((width - 80) / Math.max(lineData.length, 2)))}
                initialSpacing={20}
              />
            </ScrollView>
          ) : (
            <View className="py-8 items-center"><Text className="text-slate-400 font-bold">Chưa có dữ liệu cân nặng</Text></View>
          )}

          <View className="flex-row gap-6 pt-4 border-t border-slate-50">
            {/* BMI */}
            <View className="flex-1">
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">BMI</Text>
              <Text className="text-2xl font-[900] text-slate-800 tracking-tighter">{bodyStats?.bmi || 0}</Text>
              {(() => {
                const bmi = bodyStats?.bmi || 0;
                const info = bmi < 18.5 ? { label: 'Thiếu cân', color: '#3B82F6' }
                  : bmi < 23 ? { label: 'Bình thường', color: '#10B981' }
                    : bmi < 25 ? { label: 'Thừa cân', color: '#F59E0B' }
                      : { label: 'Béo phì', color: '#EF4444' };
                return bmi > 0
                  ? <Text className="text-xs font-black mt-0.5" style={{ color: info.color }}>{info.label}</Text>
                  : null;
              })()}
            </View>

            {/* Tốc độ thay đổi */}
            <View className="flex-1">
              <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Thay đổi</Text>
              {(() => {
                const rate = bodyStats?.changeRatePerWeek || 0;
                const abs = Math.abs(rate);
                const label = rate < 0 ? `Giảm ${abs} kg/tuần` : rate > 0 ? `Tăng ${abs} kg/tuần` : 'Ổn định';
                const color = rate < 0 ? '#10B981' : rate > 0 ? '#F97316' : '#94A3B8';
                return <Text className="text-base font-black tracking-tight" style={{ color }}>{label}</Text>;
              })()}
            </View>
          </View>
        </Animated.View>

        {/* ── THÓI QUEN ĂN UỐNG ── */}
        <View className="mb-5 mt-2">
          <Text className="text-[22px] font-black text-slate-800 tracking-tight">Thói quen ăn uống</Text>
        </View>

        {/* Phân bổ bữa ăn – card riêng, không có title */}
        <Animated.View entering={FadeInDown.delay(360).springify()} className="mb-6">

          {foodPieData.length > 0 ? (
            <View className="flex-row items-center">
              <PieChart data={foodPieData} donut radius={58} innerRadius={36} showText textColor="white" textSize={10} textBackgroundRadius={12} />
              <View className="flex-1 ml-5 gap-y-3">
                {foodPieData.map((item: any, idx: number) => {
                  const meta = MEAL_META[item.label];
                  return (
                    <View key={`${item.label}-${idx}`} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons
                          name={(meta?.icon || 'food') as any}
                          size={13} color={item.color}
                        />
                        <Text className="text-xs font-semibold text-slate-500">{meta?.label || item.label}</Text>
                      </View>
                      <Text className="text-xs font-black text-slate-700">{item.value} kcal</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="py-8 items-center"><Text className="text-slate-400 font-bold">Chưa có dữ liệu bữa ăn</Text></View>
          )}
        </Animated.View>

        {/* Món ăn hay dùng */}
        <View className="mb-5 mt-2">
          <Text className="text-[22px] font-black text-slate-800 tracking-tight">Món ăn hay dùng</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(420).springify()} className="mb-6">
          {foodInsights?.topFoods && foodInsights.topFoods.length > 0 ? (
            <View className="gap-y-3">
              {foodInsights.topFoods.slice(0, 5).map((food, index) => {
                const imageUri = resolveImg(food.image);
                return (
                  <View key={food.id} className="flex-row items-center py-3 px-4 rounded-[22px] border border-slate-50" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                    <Text className="w-6 font-black text-slate-300 text-base mr-3">#{index + 1}</Text>
                    <View className="w-11 h-11 bg-slate-100 rounded-[16px] overflow-hidden mr-3">
                      {imageUri
                        ? <Image source={{ uri: imageUri }} className="w-full h-full" />
                        : <View className="flex-1 items-center justify-center"><MaterialCommunityIcons name="food-apple" size={20} color="#94A3B8" /></View>
                      }
                    </View>
                    <View className="flex-1">
                      <Text className="text-[14px] font-black text-slate-800" numberOfLines={1}>{food.name}</Text>
                      <Text className="text-xs font-bold text-slate-400">{Math.round(food.calories)} kcal</Text>
                    </View>
                    <View className="bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      <Text className="text-sm font-black text-indigo-500">{food.timesEaten} lần</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="py-10 items-center">
              <MaterialCommunityIcons name="food-off" size={40} color="#E2E8F0" />
              <Text className="text-slate-300 font-black mt-3">Chưa có dữ liệu món ăn</Text>
            </View>
          )}
        </Animated.View>



      </Animated.ScrollView>
    </View>
  );
}