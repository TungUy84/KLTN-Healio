import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Dimensions, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import {
  PlusIcon, XMarkIcon, ChevronRightIcon,
  ArrowTrendingUpIcon, ScaleIcon, TrophyIcon, FireIcon
} from "react-native-heroicons/solid";
import { userService } from '../../services/userService';
import { useIsFocused } from '@react-navigation/native';
import { BarChart, LineChart } from "react-native-gifted-charts";
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Helper to calculate estimated weight based on calorie deficit (Theoretical)
const calculateProjectedWeight = (currentWeight: number, tdee: number, avgDailyCalories: number, days: number = 7) => {
  const dailyDeficit = tdee - avgDailyCalories;
  const totalDeficit = dailyDeficit * days;
  const weightChange = totalDeficit / 7700;
  return (currentWeight - weightChange).toFixed(1);
};

export default function ProgressScreen() {
  const isFocused = useIsFocused();

  // Data State
  const [calorieStats, setCalorieStats] = useState<any[]>([]);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [logging, setLogging] = useState(false);

  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stats, history, userProfile] = await Promise.all([
        userService.getWeeklyStats(),
        userService.getWeightHistory(),
        userService.getProfile()
      ]);

      setCalorieStats(stats);
      setWeightHistory(history);
      setProfile(userProfile);

      let curr = 0;
      if (userProfile.UserProfile?.current_weight) {
        curr = userProfile.UserProfile.current_weight;
      } else if (history.length > 0) {
        curr = history[history.length - 1].weight;
      }
      setCurrentWeight(curr);
      setNewWeight(curr.toString()); // Pre-fill

      checkGoalReached(curr, userProfile.UserProfile);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkGoalReached = (current: number, userProfile: any) => {
    if (!userProfile || !userProfile.goal_weight) return;
    const target = userProfile.goal_weight;
    const type = userProfile.goal_type;

    // Logic: Congratulate if goal reached
    let reached = false;
    if (type === 'lose_weight' && current <= target) reached = true;
    if (type === 'gain_weight' && current >= target) reached = true;

    // Only show if not already maintenance?
    if (reached && type !== 'maintain') {
      setShowCelebration(true);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const handleLogWeight = async () => {
    Keyboard.dismiss();
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số cân hợp lệ');
      return;
    }
    try {
      setLogging(true);
      await userService.logWeight(parseFloat(newWeight));
      setModalVisible(false);
      Alert.alert('Thành công', 'Đã ghi nhận cân nặng hôm nay');
      fetchData();
    } catch (e) {
      Alert.alert('Lỗi', 'Ghi nhận thất bại');
    } finally {
      setLogging(false);
    }
  };

  const handleSwitchToMaintain = async () => {
    try {
      await userService.updateProfile({ goal_type: 'maintain' });
      setShowCelebration(false);
      Alert.alert('Đã cập nhật', 'Chế độ đã chuyển sang Giữ cân. TDEE sẽ được tính lại.');
      fetchData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật chế độ');
    }
  };

  // --- Chart Data Layout ---
  const barData = calorieStats.map(item => {
    const isOver = item.calories > item.tdee;
    const dateObj = new Date(item.date);
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dateObj.getDay()];
    return {
      value: item.calories,
      label: dayName,
      frontColor: isOver ? '#F87171' : '#34D399', // Soft Red / Soft Green
      topLabelComponent: () => (
        <Text className="text-gray-500 text-[10px] font-bold mb-1">
          {Math.round(item.calories)}
        </Text>
      ),
    };
  });

  const tdeeVal = calorieStats.length > 0 ? calorieStats[0].tdee : 2000;

  // Weight Chart
  let chartLineData: any[] = weightHistory.map(item => ({
    value: parseFloat(item.weight),
    label: `${new Date(item.date).getDate()}/${new Date(item.date).getMonth() + 1}`,
    dataPointText: parseFloat(item.weight).toString(),
    textShiftY: -20,
    textColor: Colors.primary,
    textFontSize: 12
  }));

  if (chartLineData.length === 1) {
    chartLineData = [
      { value: chartLineData[0].value, label: '', hideDataPoint: true },
      chartLineData[0]
    ];
  }

  return (
    <View className="flex-1 bg-slate-100">
      <SafeAreaView edges={['top']} className="bg-primary">
        <View className="px-5 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-xs font-semibold uppercase tracking-widest">Theo dõi sức khỏe</Text>
            <Text className="text-white text-3xl font-extrabold mt-1">Báo cáo & Thống kê</Text>
          </View>
          <View className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-lg">
            <TrophyIcon size={24} color={Colors.primary} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 5, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* 1. Diet Information Card */}
        <TouchableOpacity
          className="bg-white rounded-3xl p-5 mb-6 shadow-sm"
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs text-slate-400 font-semibold uppercase mb-1">Chế độ dinh dưỡng</Text>
              <Text className="text-xl font-extrabold text-slate-800 mb-2">{profile?.UserNutritionTarget?.DietPreset?.name || 'Cân bằng'}</Text>
              <View className="flex-row">
                <View className="flex-row items-center bg-amber-50 px-3 py-1 rounded-xl">
                  <FireIcon size={12} color="#F59E0B" />
                  <Text className="text-amber-600 text-xs font-bold ml-1">{tdeeVal} kcal/ngày</Text>
                </View>
              </View>
            </View>
            <ChevronRightIcon size={20} color="#CBD5E1" />
          </View>

          <View className="h-[1px] bg-slate-100 my-4" />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-slate-400 mb-1">Mục tiêu</Text>
              <Text className="text-base font-semibold text-slate-700">
                {profile?.UserProfile?.goal_type === 'lose_weight' ? 'Giảm cân' :
                  profile?.UserProfile?.goal_type === 'gain_weight' ? 'Tăng cân' : 'Giữ cân'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-slate-400 mb-1">Cân nặng mong muốn</Text>
              <Text className="text-base font-semibold text-slate-700">{profile?.UserProfile?.goal_weight || '--'} kg</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Weight Chart */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Cân nặng thực tế</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-primary flex-row items-center px-3 py-1.5 rounded-full">
              <PlusIcon size={16} color="white" />
              <Text className="text-white text-xs font-bold ml-1">Cập nhật</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl p-5 shadow-sm">
            <View className="flex-row justify-between items-start">
              <Text className="text-4xl font-extrabold text-slate-800">{currentWeight}<Text className="text-base font-medium text-slate-400">kg</Text></Text>
              <View className="flex-row bg-emerald-50 px-2.5 py-1 rounded-xl items-center">
                <ArrowTrendingUpIcon size={14} color="#10B981" />
                <Text className="ml-1 text-emerald-600 text-xs font-bold">Cập nhật mới nhất</Text>
              </View>
            </View>

            <View className="mt-5">
              {chartLineData.length > 0 ? (
                <LineChart
                  data={chartLineData}
                  color={Colors.primary}
                  thickness={3}
                  dataPointsColor={Colors.primary}
                  startFillColor={Colors.primary}
                  endFillColor={Colors.primary}
                  startOpacity={0.1}
                  endOpacity={0.0}
                  areaChart
                  curved
                  hideRules
                  hideYAxisText
                  yAxisColor="transparent"
                  xAxisColor="transparent"
                  height={150}
                  spacing={60}
                  initialSpacing={20}
                  width={width - 80}
                />
              ) : (
                <View className="h-[100px] justify-center items-center">
                  <Text className="text-slate-400">Chưa có dữ liệu</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 3. Calorie Chart */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-800 mb-4">Năng lượng tiêu thụ (7 ngày)</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm">
            {barData.length > 0 ? (
              <BarChart
                data={barData}
                barWidth={18}
                spacing={24}
                roundedTop
                roundedBottom
                hideRules
                yAxisThickness={0}
                xAxisThickness={0}
                hideYAxisText
                showReferenceLine1
                referenceLine1Position={tdeeVal}
                referenceLine1Config={{ color: '#F59E0B', dashWidth: 4, dashGap: 4, thickness: 1 }}
                height={160}
                width={width - 80}
              />
            ) : (
              <View className="p-5 items-center">
                <Text className="text-slate-400">Đang tải dữ liệu...</Text>
              </View>
            )}
            <View className="flex-row justify-center mt-4 gap-5">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                <Text className="text-slate-500 text-xs font-medium">Tốt ({'<='} TDEE)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                <Text className="text-slate-500 text-xs font-medium">Vượt mức</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal - Weight Update with Keyboard Avoidance */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-slate-900/60 justify-end">
            <TouchableOpacity className="flex-1" onPress={() => setModalVisible(false)} />
            <View className="bg-white rounded-t-[32px] p-6 pb-10 min-h-[300px]">
              <View className="w-10 h-1 bg-slate-200 rounded-full self-center top-2 mb-6" />

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-800">Cập nhật cân nặng</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                  <XMarkIcon size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-500 mb-6 leading-6">
                Nhập số cân mới nhất để hệ thống tính toán lại lộ trình của bạn.
              </Text>

              <View className="flex-row justify-center mb-8">
                <TextInput
                  className="text-5xl font-extrabold text-primary border-b-2 border-slate-200 py-2 text-center w-[200px]"
                  value={newWeight}
                  onChangeText={setNewWeight}
                  keyboardType="numeric"
                  placeholder="0.0"
                  placeholderTextColor="#CBD5E1"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30"
                onPress={handleLogWeight}
                disabled={logging}
              >
                {logging ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Lưu Cân Nặng</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/80 justify-center px-5">
          <View className="bg-white rounded-[32px] items-center p-8">
            <TrophyIcon size={64} color="#F59E0B" />
            <Text className="text-2xl font-extrabold text-slate-800 mt-6 mb-2 text-center">Xin chúc mừng! 🎉</Text>
            <Text className="text-center text-slate-500 text-base mb-6 leading-6">
              Bạn đã đạt được mục tiêu cân nặng <Text className="font-bold text-slate-800">{profile?.UserProfile?.goal_weight}kg</Text>!
              Đây là một hành trình tuyệt vời.
            </Text>

            <View className="bg-amber-50 p-4 rounded-xl mb-6 w-full">
              <Text className="text-center text-amber-700 text-sm font-medium">
                Bạn có muốn chuyển sang chế độ <Text className="font-bold">Giữ cân (Maintenance)</Text> để duy trì vóc dáng này không?
              </Text>
            </View>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowCelebration(false)}
                className="flex-1 py-4 bg-slate-100 rounded-2xl items-center"
              >
                <Text className="text-slate-500 font-bold">Để sau</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSwitchToMaintain}
                className="flex-1 py-4 bg-primary rounded-2xl items-center shadow-lg shadow-primary/20"
              >
                <Text className="text-white font-bold">Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}