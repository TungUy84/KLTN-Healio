import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Dimensions, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { userService, CalculatedMetrics } from '../../services/userService';

// --- MOCK DATA ---
const DAILY_LOG_MOCK = {
  eaten: 0,
  carbs: 0,
  protein: 0,
  fat: 0,
  meals: {
    breakfast: { calories: 0, items: [] },
    lunch: { calories: 0, items: [] },
    dinner: { calories: 0, items: [] },
    snack: { calories: 0, items: [] }
  }
};

const { width } = Dimensions.get('window');

// --- COMPONENTS ---

const MealCard = ({ 
  title, calories, icon, color, bgColor, onAdd 
}: { title: string, calories: number, icon: any, color: string, bgColor: string, onAdd: () => void }) => {
  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-4">
          <View className={`w-12 h-12 ${bgColor} rounded-full items-center justify-center`}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-lg">{title}</Text>
            <Text className="text-gray-500 text-sm font-medium">
              {calories > 0 ? `${calories} Kcal` : 'Chưa nhập'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={onAdd}
          className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center border border-emerald-100 active:bg-emerald-100"
        >
          <Ionicons name="add" size={24} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Empty State placeholder / List Items would go here */}
      {calories === 0 && (
        <View className="bg-gray-50 rounded-xl p-3 items-center justify-center border border-dashed border-gray-200 mt-1">
          <Text className="text-gray-400 text-xs">Chưa có món ăn nào</Text>
        </View>
      )}
    </View>
  );
};

export default function DiaryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [dailyLog, setDailyLog] = useState(DAILY_LOG_MOCK);

  // Load Data
  const fetchMetrics = async () => {
    try {
      const data = await userService.getCalculatedMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMetrics();
      setDailyLog(DAILY_LOG_MOCK); 
    }, [selectedDate])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  }, []);

  // Date Logic
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
    return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  // Calculations
  const targetCalories = metrics?.target_calories || 2000;
  const eatenCalories = dailyLog.eaten;
  const remainingCalories = targetCalories - eatenCalories;
  
  const progressPercent = Math.min((eatenCalories / targetCalories) * 100, 100);
  
  // Macros Targets
  const targetCarb = metrics?.target_carb_g || 250;
  const targetProtein = metrics?.target_protein_g || 150;
  const targetFat = metrics?.target_fat_g || 65;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      
      {/* HEADER AREA */}
      {/*Background */}
      <View className="bg-emerald-500 pt-12 pb-6 px-6 rounded-b-[32px] shadow-sm z-10 relative overflow-hidden">
        {/* Top Row: Date & Actions */}
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center mt-1"
                >
                    <Text className="text-white font-bold text-2xl mr-2">{formatDate(selectedDate)}</Text>
                    <Ionicons name="chevron-down" size={20} color="white" />
                </TouchableOpacity>
            </View>
            <View className="flex-row gap-3">
                 <TouchableOpacity onPress={() => changeDate(-1)} className="w-10 h-10 bg-black/10 rounded-full items-center justify-center">
                    <Ionicons name="chevron-back" size={24} color="white" />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={() => changeDate(1)} className="w-10 h-10 bg-black/10 rounded-full items-center justify-center">
                    <Ionicons name="chevron-forward" size={24} color="white" />
                 </TouchableOpacity>
            </View>
        </View>

        {/* Energy Summary Card */}
        <View className="flex-row justify-between items-end">
             <View>
                 <Text className="text-emerald-100 text-sm mb-1">Cần nạp / ngày</Text>
                 <View className="flex-row items-baseline">
                    <Text className="text-white text-5xl font-extrabold mr-2">{remainingCalories}</Text>
                    <Text className="text-emerald-100 text-lg font-medium">Kcal</Text>
                 </View>
                 <View className="bg-black/20 self-start px-3 py-1 rounded-full mt-2">
                    <Text className="text-white text-xs font-bold">{Math.round(eatenCalories)} đã tìm nạp</Text>
                 </View>
             </View>

             <View className="items-end">
                 <View className="items-end">
                    <Text className="text-emerald-100 text-xs mb-1">Mục tiêu</Text>
                    <Text className="text-white font-bold text-xl">{targetCalories}</Text>
                 </View>
             </View>
        </View>

        {/* Progress Bar */}
        <View className="mt-6 bg-black/20 h-2 rounded-full overflow-hidden w-full">
            <View style={{ width: `${progressPercent}%` as any }} className="h-full bg-white rounded-full" />
        </View>
      </View>

      {/* === CONTENT SCROLL === */}
      <ScrollView 
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
      >
        
        {/* MACRO SECTION */}
        <Text className="text-gray-800 font-bold text-lg mb-4 ml-1">Dinh dưỡng hôm nay</Text>
        <View className="flex-row gap-3 mb-8">
            {/* Carbs */}
            <View className="flex-1 bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 justify-between min-h-[110px]">
                <View className="flex-row justify-between items-start">
                    <Text className="text-gray-500 text-xs font-bold uppercase">Carbs</Text>
                    <Ionicons name="leaf" size={16} color="#3b82f6" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-xl">{dailyLog.carbs}g</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">/{targetCarb}g</Text>
                    <View className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <View style={{ width: `${Math.min((dailyLog.carbs / targetCarb) * 100, 100)}%` as any }} className="h-full bg-blue-500 rounded-full" />
                    </View>
                </View>
            </View>

            {/* Protein */}
            <View className="flex-1 bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 justify-between min-h-[110px]">
                <View className="flex-row justify-between items-start">
                    <Text className="text-gray-500 text-xs font-bold uppercase">Protein</Text>
                    <Ionicons name="fitness" size={16} color="#f97316" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-xl">{dailyLog.protein}g</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">/{targetProtein}g</Text>
                    <View className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <View style={{ width: `${Math.min((dailyLog.protein / targetProtein) * 100, 100)}%` as any }} className="h-full bg-orange-500 rounded-full" />
                    </View>
                </View>
            </View>

            {/* Fat */}
            <View className="flex-1 bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 justify-between min-h-[110px]">
                <View className="flex-row justify-between items-start">
                    <Text className="text-gray-500 text-xs font-bold uppercase">Fat</Text>
                    <Ionicons name="water" size={16} color="#eab308" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-xl">{dailyLog.fat}g</Text>
                    <Text className="text-gray-400 text-xs mt-0.5">/{targetFat}g</Text>
                    <View className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <View style={{ width: `${Math.min((dailyLog.fat / targetFat) * 100, 100)}%` as any }} className="h-full bg-yellow-500 rounded-full" />
                    </View>
                </View>
            </View>
        </View>
        
        {/* MEALS LIST */}
        <View className="flex-row justify-between items-end mb-4 ml-1">
             <Text className="text-gray-800 font-bold text-lg">Bữa ăn</Text>
        </View>

        <View className="pb-8">
            <MealCard 
                title="Bữa Sáng" 
                calories={dailyLog.meals.breakfast.calories} 
                icon="sunny"
                color="#f97316"
                bgColor="bg-orange-100" 
                onAdd={() => console.log("Add Breakfast")}
            />

            <MealCard 
                title="Bữa Trưa" 
                calories={dailyLog.meals.lunch.calories} 
                icon="restaurant"
                color="#10b981"
                bgColor="bg-emerald-100"
                onAdd={() => console.log("Add Lunch")}
            />

            <MealCard 
                title="Bữa Tối" 
                calories={dailyLog.meals.dinner.calories} 
                icon="moon"
                color="#6366f1"
                bgColor="bg-indigo-100"
                onAdd={() => console.log("Add Dinner")}
            />

            <MealCard 
                title="Bữa Phụ" 
                calories={dailyLog.meals.snack.calories} 
                icon="cafe"
                color="#db2777"
                bgColor="bg-pink-100"
                onAdd={() => console.log("Add Snack")}
            />
        </View>

      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
}
