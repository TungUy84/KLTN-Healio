import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Dimensions, Image, Platform, StyleSheet, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Circle, G } from 'react-native-svg';
import { userService, CalculatedMetrics } from '../../services/userService';
import { foodService } from '../../services/foodService';
import { Colors } from '../../constants/Colors';

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

// --- Component: Vòng tròn năng lượng --- (from HEAD - enhanced version)
const EnergyRing = ({ consumed, target, onAdd }: { consumed: number, target: number, onAdd?: () => void }) => {
  const radius = 70;
  const stroke = 12;
  const circum = 2 * Math.PI * radius;
  const percentValue = (consumed / target) * 100; // % Calo đã nạp
  const percent = Math.min(consumed / target, 1);
  const strokeDashoffset = circum - (percent * circum);
  const remaining = target - consumed;

  // AC3: Màu sắc thanh tiến độ thay đổi theo trạng thái
  // Xanh (<80%), Vàng (80-100%), Đỏ (>100%)
  let progressColor: string;
  if (percentValue < 80) {
    progressColor = Colors.primary; // Xanh (An toàn)
  } else if (percentValue <= 100) {
    progressColor = Colors.warning; // Vàng (Sắp đạt ngưỡng)
  } else {
    progressColor = Colors.error; // Đỏ (Vượt quá mục tiêu)
  }

  return (
    <View style={styles.ringCard}>
      <Text style={styles.cardHeader}>Tổng quan Năng lượng</Text>
      
      {/* AC2: Thanh tiến độ (Progress Bar) thể hiện % lượng Calo đã nạp */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarLabelRow}>
          <Text style={styles.progressBarLabel}>Tiến độ hôm nay</Text>
          <Text style={[styles.progressBarPercent, { color: progressColor }]}>
            {percentValue.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.min(percentValue, 100)}%`, 
                backgroundColor: progressColor 
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.chartArea}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <G rotation="-90" origin="80, 80">
            <Circle cx="80" cy="80" r={radius} stroke="#F5F5F5" strokeWidth={stroke} fill="transparent" />
            <Circle 
              cx="80" cy="80" r={radius} 
              stroke={progressColor} strokeWidth={stroke} fill="transparent"
              strokeDasharray={circum} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={styles.centerText}>
          <Text style={[styles.bigNum, { color: progressColor }]}>{Math.abs(remaining)}</Text>
          <Text style={styles.unit}>KCAL</Text>
          {remaining < 0 && <Text style={{fontSize: 10, color: Colors.error}}>Vượt mức</Text>}
        </View>
        {onAdd && (
          <TouchableOpacity 
            onPress={onAdd}
            className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center border border-emerald-100 active:bg-emerald-100"
            style={{ marginTop: 10 }}
          >
            <Ionicons name="add" size={24} color="#10b981" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* AC1: Hiển thị công thức tổng quát: Mục tiêu - Đã ăn = Còn lại */}
      <View style={styles.formulaContainer}>
        <View style={styles.formulaRow}>
          <Text style={styles.formulaLabel}>Mục tiêu:</Text>
          <Text style={styles.formulaValue}>{target} kcal</Text>
        </View>
        <View style={styles.formulaRow}>
          <Text style={styles.formulaLabel}>Đã ăn:</Text>
          <Text style={styles.formulaValue}>{consumed} kcal</Text>
        </View>
        <View style={styles.formulaDivider} />
        <View style={styles.formulaRow}>
          <Text style={[styles.formulaLabel, { color: progressColor, fontWeight: 'bold' }]}>Còn lại:</Text>
          <Text style={[styles.formulaValue, { color: progressColor, fontWeight: 'bold' }]}>{Math.abs(remaining)} kcal</Text>
        </View>
        <View style={styles.formulaEquation}>
          <Text style={styles.formulaEquationText}>
            {target} - {consumed} = {Math.abs(remaining)} kcal
          </Text>
        </View>
      </View>
    </View>
  );
};

// --- Component: Thanh Macro --- (from HEAD)
const MacroBar = ({ label, current, max, color }: any) => {
  const percent = Math.min((current / max) * 100, 100);
  return (
    <View style={{ marginBottom: 15 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>{label}</Text>
        <Text style={{ fontSize: 12, color: Colors.gray }}>{current} / {max}g</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#F5F5F5', borderRadius: 4 }}>
        <View style={{ width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
};

// --- Component: MealCard --- (from origin/uy)
const MealCard = ({ 
  title, calories, icon, color, bgColor, onAdd, items = [], onItemPress 
}: { 
  title: string, calories: number, icon: any, color: string, bgColor: string, 
  onAdd: () => void, items?: any[], onItemPress?: (item: any) => void 
}) => {
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
              {calories > 0 ? `${Math.round(calories)} Kcal` : 'Chưa nhập'}
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

      {/* Render Items */}
      {items.length > 0 && (
        <View style={{ marginTop: 8 }}>
          {items.map((item, index) => (
            <TouchableOpacity 
              key={item.id || index} 
              onPress={() => onItemPress && onItemPress(item)}
              style={{
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                paddingVertical: 12, 
                borderTopWidth: index === 0 ? 0 : 1, 
                borderTopColor: '#f3f4f6'
              }}
            >
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1}}>
                 {item.food?.image ? (
                     <Image source={{ uri: item.food.image }} style={{width: 40, height: 40, borderRadius: 8, backgroundColor: '#f0f0f0'}} />
                 ) : (
                     <View style={{width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center'}}>
                        <Ionicons name="fast-food" size={20} color="#ccc" />
                     </View>
                 )}
                 <View style={{flex: 1}}>
                     <Text style={{fontWeight: '600', color: Colors.text}} numberOfLines={1}>{item.food?.name || 'Món ăn'}</Text>
                     <Text style={{fontSize: 12, color: Colors.gray}}>{item.amount} {item.food?.serving_unit}</Text>
                 </View>
              </View>
              <Text style={{fontWeight: '600', color: Colors.primary}}>{Math.round(item.calories)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State placeholder */}
      {items.length === 0 && (
        <View className="bg-gray-50 rounded-xl p-3 items-center justify-center border border-dashed border-gray-200 mt-1">
          <Text className="text-gray-400 text-xs">Chưa có món ăn nào</Text>
        </View>
      )}
    </View>
  );
};

// --- Main Component: DiaryScreen --- (from origin/uy)
export default function DiaryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [dailyLog, setDailyLog] = useState(DAILY_LOG_MOCK);

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [quantityInput, setQuantityInput] = useState('');

  // Load Data
  const fetchMetrics = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const [metricsData, logsData] = await Promise.all([
         userService.getCalculatedMetrics(),
         foodService.getDailyLog(dateStr)
      ]);
      
      setMetrics(metricsData);

      // Process Logs
      const newLogState = {
        eaten: 0, carbs: 0, protein: 0, fat: 0,
        meals: {
            breakfast: { calories: 0, items: [] as any[] },
            lunch: { calories: 0, items: [] as any[] },
            dinner: { calories: 0, items: [] as any[] },
            snack: { calories: 0, items: [] as any[] }
        }
      };

      if (Array.isArray(logsData)) {
         logsData.forEach((log: any) => {
             const type = log.meal_type as keyof typeof newLogState.meals;
             if (newLogState.meals[type]) {
                 newLogState.meals[type].items.push(log);
                 newLogState.meals[type].calories += (log.calories || 0);
             }
             newLogState.eaten += (log.calories || 0);
             newLogState.carbs += (log.carb || 0);
             newLogState.protein += (log.protein || 0);
             newLogState.fat += (log.fat || 0);
         });
      }

      setDailyLog(newLogState);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMetrics();
    }, [selectedDate])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  }, [selectedDate]); // Add selectedDate dependency

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

  // Interaction Logic
  const handleItemPress = (item: any) => {
      setSelectedLog(item);
      setQuantityInput(item.amount.toString());
      setEditModalVisible(true);
  };

  const handleDelete = () => {
    if(!selectedLog) return;
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa món này?", [
        { text: "Hủy", style: "cancel"},
        { text: "Xóa", style: "destructive", onPress: async () => {
            try {
                await foodService.deleteDailyLog(selectedLog.id);
                setEditModalVisible(false);
                fetchMetrics(); // simpler than full refresh
            } catch (e) { Alert.alert("Lỗi", "Không thể xóa nhật ký."); }
        }}
    ]);
  };

  const handleUpdate = async () => {
      if (!selectedLog) return;
      if (!quantityInput || isNaN(parseFloat(quantityInput))) {
          Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ");
          return;
      }
      try {
          await foodService.updateDailyLog(selectedLog.id, parseFloat(quantityInput));
          setEditModalVisible(false);
          fetchMetrics();
      } catch (e) { Alert.alert("Lỗi", "Không thể cập nhật."); }
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
                    <Text className="text-white text-5xl font-extrabold mr-2">{Math.round(remainingCalories)}</Text>
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
                    <Text className="text-gray-900 font-bold text-xl">{Math.round(dailyLog.carbs)}g</Text>
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
                    <Text className="text-gray-900 font-bold text-xl">{Math.round(dailyLog.protein)}g</Text>
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
                    <Text className="text-gray-900 font-bold text-xl">{Math.round(dailyLog.fat)}g</Text>
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
                items={dailyLog.meals.breakfast.items}
                onItemPress={handleItemPress}
                onAdd={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'breakfast' } })}
            />

            <MealCard 
                title="Bữa Trưa" 
                calories={dailyLog.meals.lunch.calories} 
                icon="restaurant"
                color="#10b981"
                bgColor="bg-emerald-100"
                items={dailyLog.meals.lunch.items}
                onItemPress={handleItemPress}
                onAdd={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'lunch' } })}
            />

            <MealCard 
                title="Bữa Tối" 
                calories={dailyLog.meals.dinner.calories} 
                icon="moon"
                color="#6366f1"
                bgColor="bg-indigo-100"
                items={dailyLog.meals.dinner.items}
                onItemPress={handleItemPress}
                onAdd={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'dinner' } })}
            />

            <MealCard 
                title="Bữa Phụ" 
                calories={dailyLog.meals.snack.calories} 
                icon="cafe"
                color="#db2777"
                bgColor="bg-pink-100"
                items={dailyLog.meals.snack.items}
                onItemPress={handleItemPress}
                onAdd={() => router.push({ pathname: '/(tabs)/foods', params: { meal: 'snack' } })}
            />
        </View>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)"}}
        >
            <View style={{backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24}}>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
                    <Text style={{fontSize: 20, fontWeight: "bold", color: Colors.text}}>Chỉnh sửa món ăn</Text>
                    <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                        <Ionicons name="close" size={24} color={Colors.gray} />
                    </TouchableOpacity>
                </View>

                {selectedLog && (
                    <View style={{flexDirection: 'row', gap: 16, marginBottom: 24}}>
                         {selectedLog.food?.image && (
                             <Image source={{ uri: selectedLog.food.image }} style={{width: 60, height: 60, borderRadius: 12, backgroundColor: '#f0f0f0'}} />
                         )}
                         <View style={{flex: 1}}>
                             <Text style={{fontSize: 18, fontWeight: '600', color: Colors.text}}>{selectedLog.food?.name}</Text>
                             <Text style={{fontSize: 14, color: Colors.primary, fontWeight: '500', marginTop: 4}}>
                                {Math.round(Platform.OS === 'ios' ? selectedLog.food?.calories : (selectedLog.food?.calories || 0) * (parseFloat(quantityInput) || 0))} Kcal 
                                <Text style={{color: Colors.gray, fontWeight: '400'}}> (Ước tính)</Text>
                             </Text>
                         </View>
                    </View>
                )}

                <Text style={{fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 8}}>Số lượng / Khối lượng</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32}}>
                    <TextInput 
                        style={{
                            flex: 1, height: 50, borderWidth: 1, borderColor: '#e5e7eb', 
                            borderRadius: 12, paddingHorizontal: 16, fontSize: 16, fontWeight: '600'
                        }}
                        keyboardType="numeric"
                        value={quantityInput}
                        onChangeText={setQuantityInput}
                        placeholder="Nhập số lượng..."
                    />
                    <View style={{height: 50, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#f3f4f6', borderRadius: 12}}>
                        <Text style={{fontWeight: '600', color: Colors.gray}}>{selectedLog?.food?.serving_unit || 'đơn vị'}</Text>
                    </View>
                </View>
                
                <View style={{flexDirection: 'row', gap: 12}}>
                    <TouchableOpacity 
                        onPress={handleDelete}
                        style={{flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#ef4444', justifyContent: 'center', alignItems: 'center'}}
                    >
                        <Text style={{color: '#ef4444', fontWeight: 'bold', fontSize: 16}}>Xóa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleUpdate}
                        style={{flex: 2, height: 50, borderRadius: 25, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center'}}
                    >
                        <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Cập nhật</Text>
                    </TouchableOpacity>
                </View>
                <View style={{height: 20}} /> 
            </View>
        </KeyboardAvoidingView>
      </Modal>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  date: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  bellBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  
  ringCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 20, alignItems: 'center', elevation: 2, marginBottom: 20 },
  cardHeader: { fontSize: 16, color: Colors.gray, fontWeight: '600', marginBottom: 16 },
  
  // Progress Bar styles (from HEAD)
  progressBarContainer: { width: '100%', marginBottom: 20 },
  progressBarLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressBarLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  progressBarPercent: { fontSize: 14, fontWeight: 'bold' },
  progressBarBg: { height: 12, backgroundColor: '#F5F5F5', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  
  chartArea: { marginVertical: 20, alignItems: 'center', justifyContent: 'center' },
  centerText: { position: 'absolute', alignItems: 'center' },
  bigNum: { fontSize: 36, fontWeight: 'bold', color: Colors.primary },
  unit: { fontSize: 12, fontWeight: 'bold', color: Colors.gray },
  
  // Formula styles (AC1: Mục tiêu - Đã ăn = Còn lại) (from HEAD)
  formulaContainer: { width: '100%', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  formulaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  formulaLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
  formulaValue: { fontSize: 16, fontWeight: '600', color: Colors.text },
  formulaDivider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },
  formulaEquation: { marginTop: 8, padding: 12, backgroundColor: '#F8F9FA', borderRadius: 8 },
  formulaEquationText: { fontSize: 15, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: Colors.gray },
  statVal: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  divider: { width: 1, height: 30, backgroundColor: '#EEE' },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  secTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 1 },

  advisorCard: { flexDirection: 'row', backgroundColor: '#E8F5E9', marginHorizontal: 20, padding: 15, borderRadius: 16, marginBottom: 25, alignItems: 'center' },
  advisorTitle: { fontWeight: 'bold', color: '#2E7D32', marginBottom: 2 },
  advisorText: { fontSize: 13, color: '#333' },

  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 10, elevation: 1 },
  mealName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  mealCal: { fontSize: 13, color: Colors.gray },
  addMiniBtn: { width: 32, height: 32, backgroundColor: '#F5F5F5', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
