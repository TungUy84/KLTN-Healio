import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../constants/Colors';
import { BellIcon, PlusIcon } from "react-native-heroicons/outline";
import Svg, { Circle, G } from 'react-native-svg';
import { getCalculatedMetrics, getProfile } from '../../services/userService';
import type { CalculatedMetrics, User } from '../../services/userService';

// --- Component: Vòng tròn năng lượng ---
const EnergyRing = ({ consumed, target }: { consumed: number, target: number }) => {
  const radius = 70;
  const stroke = 12;
  const circum = 2 * Math.PI * radius;
  const percent = Math.min(consumed / target, 1);
  const strokeDashoffset = circum - (percent * circum);
  const remaining = target - consumed;

  // Đổi màu khi vượt quá
  const progressColor = remaining < 0 ? '#E53935' : Colors.primary;

  return (
    <View style={styles.ringCard}>
      <Text style={styles.cardHeader}>Năng lượng còn lại</Text>
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
          {remaining < 0 && <Text style={{fontSize: 10, color: 'red'}}>Vượt mức</Text>}
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Đã nạp</Text>
          <Text style={styles.statVal}>{consumed}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Mục tiêu</Text>
          <Text style={styles.statVal}>{target}</Text>
        </View>
      </View>
    </View>
  );
};

// --- Component: Thanh Macro ---
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

export default function HomeScreen() {
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsData, profileData] = await Promise.all([
        getCalculatedMetrics(),
        getProfile(),
      ]);
      console.log('Metrics loaded:', metricsData);
      console.log('BMI value:', metricsData?.bmi, 'Type:', typeof metricsData?.bmi);
      setMetrics(metricsData);
      setProfile(profileData);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.gray }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // TODO: Thay 1250 bằng tổng calories đã consume từ DailyLog
  const consumedToday = 1250;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          <Text style={styles.greeting}>Chào {profile?.full_name || 'bạn'}! 👋</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <BellIcon size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Vòng tròn năng lượng */}
        <EnergyRing consumed={consumedToday} target={metrics?.target_calories || 2000} />

        {/* Macros */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>Dinh dưỡng đa lượng</Text>
          <View style={styles.card}>
            <MacroBar label="Protein (Đạm)" current={90} max={metrics?.target_protein_g || 150} color={Colors.secondary} />
            <MacroBar label="Carbs (Đường bột)" current={140} max={metrics?.target_carb_g || 250} color={Colors.primary} />
            <MacroBar label="Fat (Chất béo)" current={35} max={metrics?.target_fat_g || 65} color="#E53935" />
          </View>
        </View>

        {/* Thông tin sức khỏe */}
        {metrics && typeof metrics.bmi === 'number' && !isNaN(metrics.bmi) ? (
          <View style={styles.advisorCard}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>💪</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.advisorTitle}>Chỉ số sức khỏe</Text>
              <Text style={styles.advisorText}>
                BMI: {metrics.bmi.toFixed(1)} • BMR: {Math.round(metrics.bmr || 0)} kcal • TDEE: {Math.round(metrics.tdee || 0)} kcal
              </Text>
              <Text style={styles.advisorText}>
                Mục tiêu: {metrics.current_goal === 'lose_weight' ? '📉 Giảm cân' : metrics.current_goal === 'maintain' ? '⚖️ Duy trì' : '💪 Tăng cân'} • 
                Hoạt động: {metrics.current_activity_level === 'sedentary' ? 'Ít' : metrics.current_activity_level === 'light' ? 'Nhẹ' : metrics.current_activity_level === 'moderate' ? 'Vừa' : metrics.current_activity_level === 'active' ? 'Cao' : 'Rất cao'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.advisorCard}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>ℹ️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.advisorTitle}>Hoàn thành hồ sơ</Text>
              <Text style={styles.advisorText}>
                Vui lòng hoàn tất các bước onboarding để xem chỉ số sức khỏe của bạn.
              </Text>
            </View>
          </View>
        )}

        {/* Danh sách bữa ăn */}
        <View style={styles.section}>
          <Text style={styles.secTitle}>Nhật ký bữa ăn</Text>
          {['Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ăn vặt'].map((meal, idx) => (
            <View key={idx} style={styles.mealRow}>
              <View>
                <Text style={styles.mealName}>{meal}</Text>
                <Text style={styles.mealCal}>450 kcal</Text>
              </View>
              <TouchableOpacity style={styles.addMiniBtn}>
                <PlusIcon size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
  cardHeader: { fontSize: 16, color: Colors.gray, fontWeight: '500' },
  chartArea: { marginVertical: 20, alignItems: 'center', justifyContent: 'center' },
  centerText: { position: 'absolute', alignItems: 'center' },
  bigNum: { fontSize: 36, fontWeight: 'bold', color: Colors.primary },
  unit: { fontSize: 12, fontWeight: 'bold', color: Colors.gray },
  
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