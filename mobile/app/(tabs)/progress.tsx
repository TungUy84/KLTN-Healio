import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Dimensions, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { useIsFocused } from '@react-navigation/native';
import { BarChart, LineChart } from "react-native-gifted-charts";
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

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

    let reached = false;
    if (type === 'lose_weight' && current <= target) reached = true;
    if (type === 'gain_weight' && current >= target) reached = true;

    if (reached && type !== 'maintain') {
      setShowCelebration(true);
    }
  };

  useEffect(() => {
    if (isFocused) fetchData();
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
      frontColor: isOver ? '#FB7185' : '#34D399', // Rose or Emerald
      topLabelComponent: () => (
        <Text className="text-slate-400 text-[10px] font-bold mb-1">{Math.round(item.calories)}</Text>
      ),
    };
  });

  const tdeeVal = calorieStats.length > 0 ? calorieStats[0].tdee : 2000;

  let chartLineData: any[] = weightHistory.map(item => ({
    value: parseFloat(item.weight),
    label: `${new Date(item.date).getDate()}/${new Date(item.date).getMonth() + 1}`,
    dataPointText: parseFloat(item.weight).toString(),
    textShiftY: -20,
    textColor: '#0D9488',
    textFontSize: 12
  }));

  if (chartLineData.length === 1) {
    chartLineData = [{ value: chartLineData[0].value, label: '', hideDataPoint: true }, chartLineData[0]];
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">

      {/* Header */}
      <View className="bg-white px-5 pt-12 pb-4 shadow-sm z-10">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Tiến độ</Text>
            <Text className="text-2xl font-black text-slate-800">Thống kê & Báo cáo</Text>
          </View>
          <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center border border-orange-100">
            <Feather name="bar-chart-2" size={20} color="#F97316" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* 1. Diet Information Card */}
        <AnimatedView entering={FadeInDown.delay(100).duration(500)} className="mb-6">
          <TouchableOpacity
            className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100"
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.9}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold uppercase mb-1">Chế độ dinh dưỡng</Text>
                <Text className="text-xl font-bold text-slate-800 mb-2">{profile?.UserNutritionTarget?.DietPreset?.name || 'Cân bằng'}</Text>
                <View className="flex-row">
                  <View className="flex-row items-center bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    <Feather name="activity" size={12} color="#F97316" />
                    <Text className="text-orange-600 text-xs font-bold ml-1">{tdeeVal} kcal/ngày</Text>
                  </View>
                </View>
              </View>
              <View className="bg-slate-50 p-2 rounded-full">
                <Feather name="chevron-right" size={20} color="#94A3B8" />
              </View>
            </View>

            <View className="h-[1px] bg-slate-50 my-4" />

            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-slate-400 mb-1 font-medium">Mục tiêu</Text>
                <Text className="text-sm font-bold text-slate-700">
                  {profile?.UserProfile?.goal_type === 'lose_weight' ? 'Giảm cân' :
                    profile?.UserProfile?.goal_type === 'gain_weight' ? 'Tăng cân' : 'Giữ cân'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-slate-400 mb-1 font-medium">Cân nặng mong muốn</Text>
                <Text className="text-sm font-bold text-slate-700">{profile?.UserProfile?.goal_weight || '--'} kg</Text>
              </View>
            </View>
          </TouchableOpacity>
        </AnimatedView>

        {/* 2. Weight Chart */}
        <AnimatedView entering={FadeInDown.delay(200).duration(500)} className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Cân nặng thực tế</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-teal-600 flex-row items-center px-4 py-2 rounded-full shadow-sm shadow-teal-200" activeOpacity={0.8}>
              <Feather name="plus" size={16} color="white" />
              <Text className="text-white text-xs font-bold ml-1">Cập nhật</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-4xl font-black text-slate-800 tracking-tight">{currentWeight}<Text className="text-base font-medium text-slate-400 ml-1">kg</Text></Text>
              <View className="flex-row bg-emerald-50 px-3 py-1.5 rounded-full items-center border border-emerald-100">
                <Feather name="trending-up" size={14} color="#10B981" />
                <Text className="ml-1 text-emerald-600 text-xs font-bold">Mới nhất</Text>
              </View>
            </View>

            <View className="mt-2">
              {chartLineData.length > 0 ? (
                <LineChart
                  data={chartLineData}
                  color="#0D9488"
                  thickness={3}
                  dataPointsColor="#0D9488"
                  startFillColor="#0D9488"
                  endFillColor="#0D9488"
                  startOpacity={0.15}
                  endOpacity={0.01}
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
                <View className="h-[150px] justify-center items-center">
                  <Text className="text-slate-400">Chưa có dữ liệu theo dõi</Text>
                </View>
              )}
            </View>
          </View>
        </AnimatedView>

        {/* 3. Calorie Chart */}
        <AnimatedView entering={FadeInDown.delay(300).duration(500)} className="mb-8">
          <Text className="text-lg font-bold text-slate-800 mb-4">Năng lượng tiêu thụ (7 ngày)</Text>
          <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
            {barData.length > 0 ? (
              <BarChart
                data={barData}
                barWidth={16}
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
              <View className="h-[160px] justify-center items-center">
                <Text className="text-slate-400">Đang tải biểu đồ...</Text>
              </View>
            )}
            <View className="flex-row justify-center mt-6 gap-6">
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2" />
                <Text className="text-slate-500 text-xs font-medium">Tốt (&lt; TDEE)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-2" />
                <Text className="text-slate-500 text-xs font-medium">Vượt mức</Text>
              </View>
            </View>
          </View>
        </AnimatedView>
      </ScrollView>

      {/* Modal - Weight Update */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-slate-900/40 justify-end">
            <TouchableOpacity className="flex-1" onPress={() => setModalVisible(false)} />
            <View className="bg-white rounded-t-[32px] p-8 pb-10 min-h-[340px]">
              <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-8" />

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-slate-800">Cập nhật cân nặng</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-50 rounded-full">
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-500 mb-8 leading-5 font-medium">
                Nhập số cân nặng mới nhất để Healio tính toán lại lộ trình dinh dưỡng phù hợp nhất cho bạn.
              </Text>

              <View className="flex-row justify-center mb-10">
                <View className="items-center">
                  <TextInput
                    className="text-6xl font-black text-teal-600 border-b-2 border-slate-100 py-2 text-center w-[200px]"
                    value={newWeight}
                    onChangeText={setNewWeight}
                    keyboardType="numeric"
                    placeholder="0.0"
                    placeholderTextColor="#E2E8F0"
                    autoFocus
                  />
                  <Text className="text-slate-400 font-bold mt-2 uppercase">Kilogram</Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-teal-600 py-4 rounded-2xl items-center shadow-lg shadow-teal-600/30"
                onPress={handleLogWeight}
                disabled={logging}
              >
                {logging ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Lưu chỉ số</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/80 justify-center px-6">
          <View className="bg-white rounded-[32px] items-center p-8">
            <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center mb-6 border-4 border-amber-100">
              <Feather name="award" size={40} color="#F59E0B" />
            </View>
            <Text className="text-2xl font-black text-slate-800 mb-2 text-center">Xin chúc mừng! 🎉</Text>
            <Text className="text-center text-slate-500 text-base mb-8 leading-6">
              Bạn đã đạt được mục tiêu cân nặng <Text className="font-bold text-slate-800">{profile?.UserProfile?.goal_weight}kg</Text>!
              Hãy tự hào về hành trình tuyệt vời này.
            </Text>

            <View className="bg-slate-50 p-5 rounded-2xl mb-6 w-full border border-slate-100">
              <Text className="text-center text-slate-600 text-sm font-medium leading-5">
                Bạn có muốn chuyển sang chế độ <Text className="font-bold text-teal-600">Giữ cân (Maintenance)</Text> để duy trì vóc dáng này không?
              </Text>
            </View>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setShowCelebration(false)}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl items-center"
              >
                <Text className="text-slate-500 font-bold">Để sau</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSwitchToMaintain}
                className="flex-1 py-4 bg-teal-600 rounded-2xl items-center shadow-lg shadow-teal-600/20"
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