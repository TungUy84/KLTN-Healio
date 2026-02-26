import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator, Dimensions,
  Platform, KeyboardAvoidingView, Keyboard, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { useIsFocused } from '@react-navigation/native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// --- STAT CARD nhỏ ở header ---
const StatPill = ({ label, value, unit, color, bg, icon }: any) => (
  <View className="flex-1 rounded-2xl p-3.5 items-center" style={{ backgroundColor: bg }}>
    <MaterialCommunityIcons name={icon} size={18} color={color} />
    <Text className="text-lg font-black mt-1" style={{ color }}>{value}</Text>
    <Text className="text-[10px] font-semibold text-slate-400">{unit}</Text>
    <Text className="text-[10px] font-semibold text-slate-400 text-center">{label}</Text>
  </View>
);

// --- SECTION HEADER ---
const SectionHeader = ({ title, subtitle }: any) => (
  <View className="mb-4">
    <Text className="text-lg font-black text-slate-800">{title}</Text>
    {subtitle && <Text className="text-xs font-medium text-slate-400 mt-0.5">{subtitle}</Text>}
  </View>
);

export default function ProgressScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [calorieStats, setCalorieStats] = useState<any[]>([]);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setNewWeight(curr.toString());
      checkGoalReached(curr, userProfile.UserProfile);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkGoalReached = (current: number, userProfile: any) => {
    if (!userProfile?.goal_weight) return;
    const { goal_weight: target, goal_type: type } = userProfile;
    const reached =
      (type === 'lose_weight' && current <= target) ||
      (type === 'gain_weight' && current >= target);
    if (reached && type !== 'maintain') setShowCelebration(true);
  };

  useEffect(() => { if (isFocused) fetchData(); }, [isFocused]);

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
    } catch { Alert.alert('Lỗi', 'Ghi nhận thất bại'); }
    finally { setLogging(false); }
  };

  const handleSwitchToMaintain = async () => {
    try {
      await userService.updateProfile({ goal_type: 'maintain' });
      setShowCelebration(false);
      Alert.alert('Đã cập nhật', 'Chế độ đã chuyển sang Giữ cân.');
      fetchData();
    } catch { Alert.alert('Lỗi', 'Không thể cập nhật chế độ'); }
  };

  // --- Chart data ---
  const CHART_WIDTH = width - 80; // 20px page padding + 20px card padding mỗi bên
  const tdeeVal = calorieStats.length > 0 ? calorieStats[0].tdee : 2000;

  const barData = calorieStats.map(item => {
    const isOver = item.calories > item.tdee;
    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(item.date).getDay()];
    return {
      value: Math.round(item.calories),
      label: dayName,
      frontColor: isOver ? '#FB7185' : '#34D399',
      gradientColor: isOver ? '#FCA5A5' : '#6EE7B7',
    };
  });

  let chartLineData: any[] = weightHistory.map(item => ({
    value: parseFloat(item.weight),
    label: `${new Date(item.date).getDate()}/${new Date(item.date).getMonth() + 1}`,
    dataPointText: `${parseFloat(item.weight).toFixed(1)}`,
    textShiftY: -8,
    textShiftX: -12,
    textColor: '#059669',
    textFontSize: 11,
  }));
  if (chartLineData.length === 1) {
    chartLineData = [
      { value: chartLineData[0].value, label: '', hideDataPoint: true },
      chartLineData[0]
    ];
  }

  // Tính toán thống kê
  const avgCal = calorieStats.length
    ? Math.round(calorieStats.reduce((s, i) => s + i.calories, 0) / calorieStats.length)
    : 0;
  const goalWeight = profile?.UserProfile?.goal_weight || 0;
  const weightDiff = goalWeight && currentWeight ? Math.abs(currentWeight - goalWeight) : null;
  const goalType = profile?.UserProfile?.goal_type;
  const goalLabel = goalType === 'lose_weight' ? 'Giảm cân' : goalType === 'gain_weight' ? 'Tăng cân' : 'Giữ cân';
  const daysLogged = calorieStats.filter(d => d.calories > 0).length;

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ===== GRADIENT HEADER ===== */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 28, paddingHorizontal: 20 }}
      >
        {/* Title row */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-emerald-400 text-[11px] font-bold tracking-widest mb-1">THỐNG KÊ</Text>
            <Text className="text-white text-2xl font-black">Tiến độ của tôi</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="w-10 h-10 rounded-2xl items-center justify-center border border-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <Feather name="user" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick stats row */}
        <View className="flex-row gap-3">
          <StatPill
            label="Cân nặng" value={currentWeight || '--'} unit="kg"
            color="#34D399" bg="rgba(52,211,153,0.12)"
            icon="scale-bathroom"
          />
          <StatPill
            label="Mục tiêu" value={goalWeight || '--'} unit="kg"
            color="#818CF8" bg="rgba(129,140,248,0.12)"
            icon="flag-outline"
          />
          <StatPill
            label="TB Calo" value={avgCal || '--'} unit="kcal"
            color="#F97316" bg="rgba(249,115,22,0.12)"
            icon="fire"
          />
          <StatPill
            label="Ngày ghi" value={daysLogged} unit="ngày"
            color="#38BDF8" bg="rgba(56,189,248,0.12)"
            icon="calendar-check"
          />
        </View>
      </LinearGradient>

      {/* Loading overlay */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-slate-400 mt-3 font-medium">Đang tải dữ liệu...</Text>
        </View>
      )}

      {!loading && (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>

          {/* ===== 1. Diet Info Card ===== */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-5">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.9}
              className="bg-white rounded-[22px] overflow-hidden border border-slate-100 shadow-sm shadow-slate-200"
            >
              <LinearGradient
                colors={['#F0FDF9', '#FFFFFF']}
                className="p-5"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center">
                      <MaterialCommunityIcons name="leaf" size={20} color="#059669" />
                    </View>
                    <View>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chế độ dinh dưỡng</Text>
                      <Text className="text-base font-black text-slate-800 mt-0.5">
                        {profile?.UserNutritionTarget?.DietPreset?.name || 'Cân bằng'}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                    <MaterialCommunityIcons name="lightning-bolt" size={12} color="#059669" />
                    <Text className="text-emerald-700 text-xs font-bold">{tdeeVal} kcal/ngày</Text>
                  </View>
                </View>

                <View className="h-px bg-slate-100 mb-4" />

                <View className="flex-row justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-lg bg-violet-50 items-center justify-center">
                      <MaterialCommunityIcons name="target" size={16} color="#7C3AED" />
                    </View>
                    <View>
                      <Text className="text-[10px] font-semibold text-slate-400">Mục tiêu</Text>
                      <Text className="text-sm font-bold text-slate-700">{goalLabel}</Text>
                    </View>
                  </View>
                  {weightDiff !== null && (
                    <View className="flex-row items-center gap-2">
                      <View className="w-8 h-8 rounded-lg bg-orange-50 items-center justify-center">
                        <MaterialCommunityIcons name="arrow-collapse-vertical" size={16} color="#EA580C" />
                      </View>
                      <View className="items-end">
                        <Text className="text-[10px] font-semibold text-slate-400">Còn cần</Text>
                        <Text className="text-sm font-bold text-slate-700">{weightDiff.toFixed(1)} kg</Text>
                      </View>
                    </View>
                  )}
                  <View className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center self-center">
                    <Feather name="chevron-right" size={14} color="#94A3B8" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ===== 2. Weight Chart ===== */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-5">
            <View className="flex-row justify-between items-center mb-3">
              <SectionHeader title="Biến động cân nặng" subtitle="Xu hướng theo thời gian" />
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500"
              >
                <Feather name="plus" size={14} color="#fff" />
                <Text className="text-white text-xs font-bold">Cập nhật</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-[22px] p-5 border border-slate-100 shadow-sm shadow-slate-200">
              {/* Current weight big display */}
              <View className="flex-row justify-between items-center mb-5">
                <View>
                  <Text className="text-[11px] font-semibold text-slate-400 mb-0.5">Hiện tại</Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-4xl font-black text-slate-800">{currentWeight}</Text>
                    <Text className="text-base font-semibold text-slate-400">kg</Text>
                  </View>
                </View>
                {goalWeight > 0 && (
                  <View className="items-end">
                    <Text className="text-[11px] font-semibold text-slate-400 mb-0.5">Mục tiêu</Text>
                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-2xl font-black text-violet-500">{goalWeight}</Text>
                      <Text className="text-sm font-semibold text-slate-400">kg</Text>
                    </View>
                  </View>
                )}
              </View>

              {chartLineData.length > 0 ? (
                <LineChart
                  data={chartLineData}
                  color="#10B981"
                  thickness={3}
                  dataPointsColor="#10B981"
                  dataPointsRadius={5}
                  startFillColor="#10B981"
                  endFillColor="#10B981"
                  startOpacity={0.2}
                  endOpacity={0.01}
                  areaChart
                  curved
                  hideRules
                  hideYAxisText
                  yAxisColor="transparent"
                  xAxisColor="#F1F5F9"
                  xAxisThickness={1}
                  xAxisLabelTextStyle={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}
                  height={160}
                  width={CHART_WIDTH}
                  spacing={Math.max(48, Math.floor(CHART_WIDTH / Math.max(chartLineData.length, 2)))}
                  initialSpacing={16}
                  endSpacing={16}
                />
              ) : (
                <View className="h-36 justify-center items-center">
                  <MaterialCommunityIcons name="chart-line-variant" size={36} color="#E2E8F0" />
                  <Text className="text-slate-400 text-sm mt-2 font-medium">Chưa có dữ liệu theo dõi</Text>
                  <Text className="text-slate-300 text-xs mt-1">Nhấn "Cập nhật" để ghi lần đầu</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* ===== 3. Calorie Bar Chart ===== */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-5">
            <SectionHeader title="Năng lượng 7 ngày qua" subtitle="So sánh với TDEE của bạn" />

            <View className="bg-white rounded-[22px] p-5 border border-slate-100 shadow-sm shadow-slate-200">
              {/* TDEE reference */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <Text className="text-xs font-semibold text-slate-500">TDEE: {tdeeVal} kcal</Text>
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <Text className="text-[11px] text-slate-400 font-medium">Đạt</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <Text className="text-[11px] text-slate-400 font-medium">Vượt</Text>
                  </View>
                </View>
              </View>

              {barData.length > 0 ? (
                <BarChart
                  data={barData}
                  barWidth={22}
                  spacing={Math.max(16, Math.floor((CHART_WIDTH - 22 * barData.length) / Math.max(barData.length - 1, 1)))}
                  roundedTop
                  roundedBottom
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor="#F1F5F9"
                  hideYAxisText
                  showGradient
                  xAxisLabelTextStyle={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}
                  showReferenceLine1
                  referenceLine1Position={tdeeVal}
                  referenceLine1Config={{
                    color: '#F59E0B',
                    dashWidth: 4,
                    dashGap: 4,
                    thickness: 1.5,
                    labelText: 'TDEE',
                    labelTextStyle: { color: '#F59E0B', fontSize: 10, fontWeight: '700' },
                  }}
                  height={160}
                  width={CHART_WIDTH}
                  initialSpacing={16}
                  endSpacing={16}
                  noOfSections={4}
                />
              ) : (
                <View className="h-40 justify-center items-center">
                  <MaterialCommunityIcons name="chart-bar" size={36} color="#E2E8F0" />
                  <Text className="text-slate-400 text-sm mt-2 font-medium">Chưa có dữ liệu tuần này</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* ===== 4. Weekly Summary Strip ===== */}
          {calorieStats.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mb-5">
              <SectionHeader title="Tổng kết tuần" subtitle="Dữ liệu 7 ngày gần nhất" />
              <View className="flex-row gap-3">
                {/* Days on target */}
                <View className="flex-1 bg-emerald-50 rounded-2xl p-4 items-center border border-emerald-100">
                  <MaterialCommunityIcons name="check-circle-outline" size={24} color="#059669" />
                  <Text className="text-2xl font-black text-emerald-600 mt-2">
                    {calorieStats.filter(d => d.calories > 0 && d.calories <= d.tdee).length}
                  </Text>
                  <Text className="text-[11px] font-semibold text-emerald-500 text-center mt-0.5">Ngày đạt mục tiêu</Text>
                </View>
                {/* Days over */}
                <View className="flex-1 bg-rose-50 rounded-2xl p-4 items-center border border-rose-100">
                  <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#E11D48" />
                  <Text className="text-2xl font-black text-rose-500 mt-2">
                    {calorieStats.filter(d => d.calories > d.tdee).length}
                  </Text>
                  <Text className="text-[11px] font-semibold text-rose-400 text-center mt-0.5">Ngày vượt mức</Text>
                </View>
                {/* Avg cal */}
                <View className="flex-1 bg-orange-50 rounded-2xl p-4 items-center border border-orange-100">
                  <MaterialCommunityIcons name="fire" size={24} color="#EA580C" />
                  <Text className="text-2xl font-black text-orange-600 mt-2">{avgCal}</Text>
                  <Text className="text-[11px] font-semibold text-orange-400 text-center mt-0.5">TB Kcal/ngày</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      )}

      {/* ===== MODAL CẬP NHẬT CÂN NẶNG ===== */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-slate-900/50 justify-end">
            <TouchableOpacity className="flex-1" onPress={() => setModalVisible(false)} />
            <View className="bg-white rounded-t-[32px] px-6 pb-10 pt-4">
              {/* Handle */}
              <View className="w-10 h-1 rounded-full bg-slate-200 self-center mb-6" />

              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-xl font-black text-slate-800">Ghi cân nặng</Text>
                  <Text className="text-xs text-slate-400 font-medium mt-0.5">Cập nhật tiến độ hôm nay</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center">
                  <Feather name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Scale icon */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 rounded-[20px] bg-emerald-50 border border-emerald-100 items-center justify-center mb-4">
                  <MaterialCommunityIcons name="scale-bathroom" size={36} color="#10B981" />
                </View>
                <View className="items-center">
                  <TextInput
                    className="text-6xl font-black text-emerald-500 border-b-2 border-slate-100 py-2 text-center"
                    style={{ minWidth: 180 }}
                    value={newWeight}
                    onChangeText={setNewWeight}
                    keyboardType="numeric"
                    placeholder="0.0"
                    placeholderTextColor="#E2E8F0"
                    autoFocus
                  />
                  <Text className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Kilogram</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogWeight}
                disabled={logging}
                className="rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  className="py-4 items-center flex-row justify-center gap-2"
                >
                  {logging
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <>
                      <MaterialCommunityIcons name="check-bold" size={18} color="#fff" />
                      <Text className="text-white font-black text-base">Lưu chỉ số</Text>
                    </>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== CELEBRATION MODAL ===== */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View className="flex-1 bg-slate-900/80 justify-center px-6">
          <View className="bg-white rounded-[32px] items-center p-8">
            {/* Trophy */}
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              className="w-24 h-24 rounded-[28px] items-center justify-center mb-6 border-4 border-amber-200"
            >
              <MaterialCommunityIcons name="trophy-outline" size={48} color="#D97706" />
            </LinearGradient>

            <Text className="text-2xl font-black text-slate-800 mb-2 text-center">Xin chúc mừng!</Text>
            <Text className="text-center text-slate-500 text-base mb-6 leading-6">
              Bạn đã đạt được mục tiêu cân nặng{' '}
              <Text className="font-bold text-slate-800">{profile?.UserProfile?.goal_weight}kg</Text>!{' '}
              Hãy tự hào về hành trình tuyệt vời này.
            </Text>

            <View className="bg-slate-50 p-4 rounded-2xl mb-6 w-full border border-slate-100">
              <Text className="text-center text-slate-600 text-sm font-medium leading-5">
                Bạn có muốn chuyển sang chế độ{' '}
                <Text className="font-bold text-emerald-600">Giữ cân (Maintenance)</Text>{' '}
                để duy trì vóc dáng này không?
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
                className="flex-1 py-4 rounded-2xl items-center overflow-hidden bg-emerald-500"
              >
                <Text className="text-white font-black">Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}