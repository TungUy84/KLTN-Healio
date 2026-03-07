import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Image, ActivityIndicator, Dimensions, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Wheat, Beef, Droplet, Flame } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, LinearTransition, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, useAnimatedScrollHandler } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop, Path } from "react-native-svg";
import { userService } from "../../services/userService";
import { foodService } from "../../services/foodService";
import { authService } from "../../services/authService";
import { useWalkthrough } from "../../context/WalkthroughContext";
import { AnimatedProgressBar } from "../../components/ui/AnimatedProgressBar";
import { AnimatedCalorieGauge } from "../../components/ui/AnimatedCalorieGauge";

const { width } = Dimensions.get("window")
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000/api";
const resolveImg = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = API_URL.replace(/\/api$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

// --- BACKGROUND AMBIENT GLOW ---
const AmbientGlowBackground = () => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
    <Svg height="100%" width="100%">
      <Defs>
        <SvgRadialGradient id="grad1" cx="50%" cy="0%" rx="80%" ry="80%" fx="50%" fy="0%">
          <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
          <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </SvgRadialGradient>
        <SvgRadialGradient id="grad2" cx="0%" cy="40%" rx="60%" ry="60%" fx="0%" fy="40%">
          <Stop offset="0%" stopColor="#34D399" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </SvgRadialGradient>
        <SvgRadialGradient id="grad3" cx="100%" cy="80%" rx="50%" ry="50%" fx="100%" fy="80%">
          <Stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </SvgRadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
    </Svg>
  </View>
);
// --- MACRO BAR ---
const MacroBar = ({ label, IconComponent, value, total, color, barClassName }: any) => {
  const pct = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <IconComponent size={11} color={color} />
          <Text className="text-slate-500 text-xs font-semibold">{label}</Text>
        </View>
        <Text className="text-slate-700 font-black text-xs">
          {value}<Text className="text-slate-400 font-medium"> /{total}g</Text>
        </Text>
      </View>
      <AnimatedProgressBar progress={pct} color={color} height={6} delay={400} />
    </View>
  );
};

// --- DAILY OVERVIEW CARD (Glass Style) ---
const DailyOverviewCard = ({ data }: any) => {
  const consumed = Math.round(data?.totalCalories || 0);
  const target = data?.targetCalories || 2000;
  const pct = Math.min((consumed / target) * 100, 100) || 0;
  const remaining = Math.max(target - consumed, 0);

  const macros = [
    {
      label: "Đạm",
      val: Math.round(data?.macros?.protein || 0),
      target: data?.targetMacros?.protein || 150,
      color: "#3B82F6",
      barClassName: "bg-blue-400",
      icon: Beef,
    },
    {
      label: "Tinh bột",
      val: Math.round(data?.macros?.carb || 0),
      target: data?.targetMacros?.carb || 250,
      color: "#10B981",
      barClassName: "bg-emerald-400",
      icon: Wheat,
    },
    {
      label: "Chất béo",
      val: Math.round(data?.macros?.fat || 0),
      target: data?.targetMacros?.fat || 65,
      color: "#EAB308",
      barClassName: "bg-yellow-400",
      icon: Droplet,
    },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      className="px-6 mb-8"
    >
      <View>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[22px] font-black text-slate-800 tracking-tight mb-3">
              Mục tiêu hôm nay
            </Text>
            <View className="flex-row items-baseline gap-1">
              <Text
                className="text-slate-800 text-[48px] font-black tracking-tighter"
                style={{ lineHeight: 56 }}
              >
                {target}
              </Text>
              <Text className="text-slate-400 text-lg font-bold ml-1">
                kcal
              </Text>
            </View>
            <Text className="text-slate-500 font-bold text-sm mt-1">
              Cần thêm {remaining} <Text className="text-xs">kcal</Text>
            </Text>
          </View>
          <View className="items-end">
            <AnimatedCalorieGauge value={consumed} target={target} delay={400} />
          </View>
        </View>

        {/* Macros Mini Panel (Progress Bars) */}
        <Animated.View entering={FadeInDown.delay(250).springify()} className="mb-8 mt-" style={{ gap: 12 }}>
          {macros.map((m, i) => (
            <MacroBar
              key={`macro-${m.label}-${i}`}
              label={m.label}
              IconComponent={m.icon}
              value={m.val}
              total={m.target}
              color={m.color}
              barClassName={m.barClassName}
            />
          ))}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const MEAL_CONFIG: Record<string, any> = {
  breakfast: {
    label: "Bữa Sáng",
    icon: "weather-sunset-up",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  lunch: {
    label: "Bữa Trưa",
    icon: "white-balance-sunny",
    color: "#F59E0B",
    bg: "#FFF7ED",
  },
  dinner: {
    label: "Bữa Tối",
    icon: "weather-night",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  snack: {
    label: "Bữa Phụ",
    icon: "cookie",
    color: "#10B981",
    bg: "#ECFDF5",
  },
};

// --- MICRONUTRIENTS CARD ---
const MicronutrientsCard = ({ data }: any) => {
  const [showAll, setShowAll] = useState(false);

  const micronutrientsMap: any = {
    fiber: { n: 'Chất xơ', i: 'leaf', c: '#10B981' },
    sugar: { n: 'Đường', i: 'cube-outline', c: '#F43F5E' },
    sodium: { n: 'Natri', i: 'shaker-outline', c: '#64748B' },
    cholesterol: { n: 'Cholest.', i: 'heart-pulse', c: '#F43F5E' },
    potassium: { n: 'Kali', i: 'lightning-bolt', c: '#EAB308' },
    calcium: { n: 'Canxi', i: 'bone', c: '#94A3B8' },
    iron: { n: 'Sắt', i: 'weight', c: '#475569' },
    vitamin_a: { n: 'Vitamin A', i: 'eye-outline', c: '#F97316' },
    vit_a: { n: 'Vitamin A', i: 'eye-outline', c: '#F97316' },
    vitamin_b1: { n: 'Vitamin B1', i: 'alpha-b-circle', c: '#8B5CF6' },
    vit_b1: { n: 'Vitamin B1', i: 'alpha-b-circle', c: '#8B5CF6' },
    vitamin_b2: { n: 'Vitamin B2', i: 'alpha-b-circle-outline', c: '#A78BFA' },
    vit_b2: { n: 'Vitamin B2', i: 'alpha-b-circle-outline', c: '#A78BFA' },
    vitamin_c: { n: 'Vitamin C', i: 'fruit-citrus', c: '#F59E0B' },
    vit_c: { n: 'Vitamin C', i: 'fruit-citrus', c: '#F59E0B' },
    vitamin_d: { n: 'Vitamin D', i: 'white-balance-sunny', c: '#FBBF24' },
    vit_d: { n: 'Vitamin D', i: 'white-balance-sunny', c: '#FBBF24' },
  };

  const allMicros = [];

  // Thêm fiber từ macros
  if (data?.macros?.fiber > 0) {
    allMicros.push({ key: 'fiber', value: data.macros.fiber, unit: 'g' });
  }

  // Thêm các micronutrients khác
  if (data?.micronutrients) {
    Object.entries(data.micronutrients).forEach(([key, value]) => {
      if ((value as number) > 0) {
        const cleanKey = key.toLowerCase().replace(/_mg$|_g$|_mcg$|_iu$/, '');
        // Tất cả vi chất đều dùng đơn vị mg
        const unit = 'mg';
        allMicros.push({ key: cleanKey, value: value as number, unit });
      }
    });
  }

  if (allMicros.length === 0) {
    // Hiển thị message nếu không có dữ liệu
    return (
      <Animated.View
        entering={FadeInDown.delay(350).springify()}
        className="px-6 mb-6"
      >
        <Text className="text-[24px] font-black text-slate-800 tracking-tight mb-4">
          Vi chất đã nạp
        </Text>
        <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <Text className="text-slate-400 text-sm text-center">
            Chưa có dữ liệu vi chất cho ngày hôm nay
          </Text>
        </View>
      </Animated.View>
    );
  }

  const displayMicros = showAll ? allMicros : allMicros.slice(0, 6);

  return (
    <Animated.View
      entering={FadeInDown.delay(350).springify()}
      className="px-6 mb-6"
    >
      <Text className="text-[24px] font-black text-slate-800 tracking-tight mt-2 mb-4">
        Vi chất đã nạp
      </Text>
      <View className="flex-row flex-wrap gap-2.5 items-center">
        {displayMicros.map((micro, index) => {
          const meta = micronutrientsMap[micro.key] || {
            n: micro.key.replace(/_/g, ' '),
            i: 'water-outline',
            c: '#3B82F6'
          };
          const val = Math.round(micro.value * 10) / 10;

          return (
            <View
              key={`micro-${micro.key}-${index}`}
              className="flex-row items-center gap-2 bg-white/80 rounded-full px-3.5 py-2.5 border border-white shadow-sm shadow-slate-200"
            >
              <MaterialCommunityIcons
                name={meta.i as any}
                size={15}
                color={meta.c}
              />
              <Text className="text-[13px] font-bold text-slate-700">
                {meta.n}
              </Text>
              <View className="w-[1px] h-3 bg-slate-200" />
              <Text className="text-[12px] font-black text-slate-800">
                {val}
                <Text className="text-[11px] font-semibold text-slate-400"> {micro.unit}</Text>
              </Text>
            </View>
          );
        })}

        {/* Toggle Button */}
        {allMicros.length > 6 && (
          <TouchableOpacity
            onPress={() => setShowAll(!showAll)}
            className="w-10 h-10 rounded-full bg-slate-100/80 items-center justify-center border border-white shadow-sm shadow-slate-200/50"
          >
            <Feather name={showAll ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const MealCard = ({ mealType, meal, onRefresh }: any) => {
  const router = useRouter();
  const cfg = MEAL_CONFIG[mealType];
  const items = meal?.items || [];
  const calories = Math.round(meal?.calories || 0);
  const carb = Math.round(meal?.macros?.carb || 0);
  const protein = Math.round(meal?.macros?.protein || 0);
  const fat = Math.round(meal?.macros?.fat || 0);

  const handleDeleteFood = (foodLogId: number, foodName: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc muốn xóa "${foodName}" khỏi nhật ký không?`,
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await foodService.deleteDailyLog(foodLogId);
              if (onRefresh) onRefresh();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa món ăn");
            }
          }
        }
      ]
    );
  };

  const renderRightActions = (foodLogId: number, foodName: string) => {
    return (
      <TouchableOpacity
        onPress={() => handleDeleteFood(foodLogId, foodName)}
        className="bg-red-500 justify-center items-center rounded-2xl mb-2.5 px-4"
        style={{
          shadowColor: '#EF4444',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8
        }}
      >
        <Feather name="trash-2" size={20} color="white" />
        <Text className="text-white text-[9px] font-bold mt-1">Xóa</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(300).springify()}
      className="px-5 mb-4"
    >
      <View
        className="bg-white/70 rounded-[28px] overflow-hidden border border-white/60 shadow-sm"
        style={{
          shadowColor: cfg.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: cfg.bg }}
            >
              <MaterialCommunityIcons
                name={cfg.icon}
                size={24}
                color={cfg.color}
              />
            </View>
            <View>
              <Text className="text-slate-800 font-black text-[18px] tracking-tight">
                {cfg.label}
              </Text>
              <Text className="text-slate-400 text-[11px] font-medium mt-0.5">
                {items.length} món
              </Text>
            </View>
          </View>
        </View>

        {/* Food Items Preview */}
        {items.length > 0 && (
          <View className="px-3 pb-3 gap-2.5">
            {items.slice(0, 2).map((food: any, idx: number) => (
              <Animated.View
                key={food.id ? `food-${food.id}-${idx}` : `food-idx-${idx}`}
                entering={FadeInLeft.delay(idx * 150 + 400).springify()}
                layout={LinearTransition.springify()}
              >
                <Swipeable
                  renderRightActions={() => renderRightActions(food.id, food.name)}
                  overshootRight={false}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (food.food_id) {
                        router.push(`/food/food-detail?id=${food.food_id}`);
                      }
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-white/60 rounded-2xl p-2.5 border border-white/40"
                  >
                    <View className="w-[60px] h-[60px] rounded-full bg-slate-100 overflow-hidden mr-3 shadow-sm shadow-slate-200">
                      {food.image ? (
                        <Image
                          source={{ uri: resolveImg(food.image) as string }}
                          className="w-full h-full"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center bg-emerald-50">
                          <MaterialCommunityIcons
                            name="food-variant"
                            size={24}
                            color="#A7F3D0"
                          />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-slate-800 font-bold text-[14px] mb-1"
                        numberOfLines={1}
                      >
                        {food.name}
                      </Text>
                      <Text className="text-slate-400 text-[11px] font-medium">
                        {food.portion} {food.unit}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1 ml-2">
                      <MaterialCommunityIcons name="fire" size={13} color="#F97316" />
                      <Text className="text-slate-700 font-black text-[13px]">
                        {food.calories}
                        <Text className="text-slate-400 text-[10px] font-bold"> kcal</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              </Animated.View>
            ))}
            {items.length > 2 && (
              <Text className="text-slate-400 text-[11px] font-bold ml-2 mt-1">
                +{items.length - 2} món khác...
              </Text>
            )}
          </View>
        )}

        {/* Footer: Macros + Calories */}
        <View className="flex-row items-center justify-between px-5 py-4 border-t border-slate-100">
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Wheat size={12} color="#10B981" />
              <Text className="text-slate-600 text-[11px] font-bold">
                {carb}g
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Beef size={12} color="#3B82F6" />
              <Text className="text-slate-600 text-[11px] font-bold">
                {protein}g
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Droplet size={12} color="#EAB308" />
              <Text className="text-slate-600 text-[11px] font-bold">
                {fat}g
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-full">
            <Flame size={16} color="#F97316" />
            <Text className="text-slate-800 font-black text-[17px]">
              {calories}
            </Text>
            <Text className="text-slate-400 text-[10px] font-bold">
              kcal
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default function DiaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyLog, setDailyLog] = useState<any>(null);

  const { startWalkthrough, registerStep, unregisterStep } = useWalkthrough();
  const step1Ref = React.useRef<View>(null);
  const step2Ref = React.useRef<View>(null);

  useEffect(() => {
    registerStep("diary_step1", step1Ref, () => { });
    registerStep("diary_step2", step2Ref, () => { });
    return () => {
      unregisterStep("diary_step1");
      unregisterStep("diary_step2");
    };
  }, []);

  useEffect(() => {
    const checkTutorial = async () => {
      if (!isLoading) {
        const hasSeen = await authService.checkEpicTutorial('diary');
        if (!hasSeen) {
          setTimeout(() => {
            startWalkthrough([
              { name: 'diary_step1', title: 'Tổng Quan Trong Ngày', content: 'Cập nhật nhanh Năng lượng và Nhóm chất (Đạm, Đường, Béo) bạn đã nạp trong ngày.' },
              { name: 'diary_step2', title: 'Thực đơn Bữa Ăn', content: 'Ghi chép và theo dõi xem từng buổi Sáng/Trưa/Tối bạn đã nạp vào những món gì.' }
            ], 'diary');
          }, 50);
        }
      }
    };
    checkTutorial();
  }, [isLoading, startWalkthrough]);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerBlurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 40], [0, 1], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    if (params?.selectedDate) {
      const d = new Date(params.selectedDate as string);
      if (!isNaN(d.getTime())) setSelectedDate(d);
    }
  }, [params?.selectedDate]);

  const toLocalDateStr = (dateObj: Date) => {
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    return new Date(dateObj.getTime() - tzOffset).toISOString().split("T")[0];
  };

  const fetchDailyData = useCallback(async (dateObj: Date) => {
    try {
      setIsLoading(true);
      const dateStr = toLocalDateStr(dateObj);
      const [metricsData, logsData] = await Promise.all([
        userService.getCalculatedMetrics(),
        foodService.getDailyLog(dateStr),
      ]);

      const newLog: any = {
        totalCalories: 0,
        targetCalories: metricsData?.target_calories || 2000,
        targetMacros: {
          carb: metricsData?.target_carb_g || 250,
          protein: metricsData?.target_protein_g || 150,
          fat: metricsData?.target_fat_g || 65,
        },
        macros: { carb: 0, protein: 0, fat: 0, fiber: 0 },
        micronutrients: {} as Record<string, number>,
        meals: {
          breakfast: {
            calories: 0,
            macros: { carb: 0, protein: 0, fat: 0, fiber: 0 },
            items: [],
          },
          lunch: {
            calories: 0,
            macros: { carb: 0, protein: 0, fat: 0, fiber: 0 },
            items: [],
          },
          dinner: {
            calories: 0,
            macros: { carb: 0, protein: 0, fat: 0, fiber: 0 },
            items: [],
          },
          snack: {
            calories: 0,
            macros: { carb: 0, protein: 0, fat: 0, fiber: 0 },
            items: [],
          },
        },
      };

      if (Array.isArray(logsData)) {
        logsData.forEach((log: any) => {
          const type: string = log.meal_type || "snack";
          const mealBucket = newLog.meals[type];
          if (mealBucket) {
            mealBucket.calories += log.calories || 0;
            mealBucket.macros.carb += log.carb || 0;
            mealBucket.macros.protein += log.protein || 0;
            mealBucket.macros.fat += log.fat || 0;
            mealBucket.macros.fiber += log.fiber || 0;
            mealBucket.items.push({
              id: log.id,
              food_id: log.food_id,
              name: log.food?.name || "Món ăn",
              portion: log.amount || 1,
              unit: log.food?.serving_unit || "phần",
              calories: Math.round(log.calories || 0),
              image: log.food?.image,
            });
          }
          newLog.totalCalories += log.calories || 0;
          newLog.macros.carb += log.carb || 0;
          newLog.macros.protein += log.protein || 0;
          newLog.macros.fat += log.fat || 0;
          newLog.macros.fiber += log.fiber || 0;

          // Tính tổng micronutrients từ food
          if (log.food?.micronutrients) {
            const micro = log.food.micronutrients;
            const amount = log.amount || 1;

            // Tự động lưu tất cả các micronutrients
            Object.keys(micro).forEach(key => {
              const lowerKey = key.toLowerCase().replace(/_mg$|_g$|_mcg$|_iu$/, '');
              const value = micro[key];

              if (value && typeof value === 'number') {
                if (!newLog.micronutrients[lowerKey]) {
                  newLog.micronutrients[lowerKey] = 0;
                }
                newLog.micronutrients[lowerKey] += value * amount;
              }
            });
          }
        });
      }
      setDailyLog(newLog);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDailyData(selectedDate);
    }, [selectedDate, fetchDailyData]),
  );

  const dateStr = toLocalDateStr(selectedDate);
  const isToday = toLocalDateStr(new Date()) === dateStr;

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <AmbientGlowBackground />

      {/* Header Blur */}
      <BlurView
        tint="light"
        intensity={50}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          backgroundColor: 'rgba(255,255,255,0.4)', // Thêm chút nền trong suốt
        }}
      >
        {/* Header Navigation */}
        <View className="flex-row justify-between items-center px-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200"
          >
            <Feather name="arrow-left" size={20} color="#334155" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Text className="text-[22px] font-black text-slate-800 tracking-tight">
              Nhật Ký
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/diary/calendar")}
            className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200"
          >
            <Feather name="calendar" size={20} color="#334155" />
          </TouchableOpacity>
        </View>
      </BlurView>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 90,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDailyData(selectedDate);
            }}
            tintColor="#10B981"
          />
        }
      >
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <>
            <View ref={step1Ref}>
              <DailyOverviewCard data={dailyLog} />
            </View>

            <View ref={step2Ref}>
              <View className="px-5 mb-4">
                <Text className="text-[24px] font-black text-slate-800 tracking-tight">
                  Thực đơn chi tiết
                </Text>
              </View>

              {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                (type) => (
                  <MealCard
                    key={type}
                    mealType={type}
                    meal={dailyLog?.meals?.[type]}
                    onRefresh={() => fetchDailyData(selectedDate)}
                  />
                ),
              )}
            </View>

            <MicronutrientsCard data={dailyLog} />
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
