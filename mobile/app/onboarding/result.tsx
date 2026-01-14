import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { calculateMetrics } from '../../utils/calculations';
import { userService } from '../../services/userService';
import { Colors } from '../../constants/Colors';

export default function ResultScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // 1. Tính toán TDEE Local
    if (data.weight && data.height) {
        const height = parseFloat(data.height);
        const weight = parseFloat(data.weight);
        const age = new Date().getFullYear() - new Date(data.dob).getFullYear();
        
        const result = calculateMetrics(
            age, 
            data.gender, 
            weight, 
            height, 
            data.activityLevel, 
            data.goalType
        );
        setMetrics(result);
    }
  }, [data]);

  const handleFinish = async () => {
    if (!metrics) return;

    try {
        setLoading(true);
        // 2. Call API Save to DB
        await userService.completeOnboarding({
            // Profile
            full_name: data.full_name,
            gender: data.gender,
            dob: data.dob.toISOString().split('T')[0],
            height: parseFloat(data.height),
            current_weight: parseFloat(data.weight),
            activity_level: data.activityLevel,
            goal_type: data.goalType,
            goal_weight: parseFloat(data.goalWeight),
            
            // Nutrition
            diet_preset_code: data.dietPreset?.code,
            tdee: metrics.tdee,
            target_calories: metrics.targetCalories
        });

        // 3. Navigate to Main App (Tabs)
        router.replace('/(tabs)');
    } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể lưu dữ liệu');
    } finally {
        setLoading(false);
    }
  };

  if (!metrics) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kế hoạch của bạn đã sẵn sàng! 🚀</Text>
        
        <View style={styles.resultBox}>
            <Text style={styles.calLabel}>Mục tiêu Calories hàng ngày</Text>
            <Text style={styles.calNumber}>{metrics.targetCalories} kcal</Text>
            <Text style={styles.tdeeLabel}>TDEE (Giữ cân): {metrics.tdee} kcal</Text>
        </View>

        <View style={styles.statRow}>
            <View style={styles.statItem}>
                <Text style={styles.statVal}>{metrics.bmi}</Text>
                <Text style={styles.statLabel}>BMI</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statVal}>{metrics.bmr}</Text>
                <Text style={styles.statLabel}>BMR</Text>
            </View>
        </View>

        <View style={styles.macroBox}>
            <Text style={styles.sectionTitle}>Phân bổ Macro ({data.dietPreset?.name})</Text>
            <View style={styles.macroRow}>
                <MacroItem label="Protein" percent={data.dietPreset?.protein_ratio} totalCal={metrics.targetCalories} color="#FF6347" />
                <MacroItem label="Carbs" percent={data.dietPreset?.carb_ratio} totalCal={metrics.targetCalories} color="#4682B4" />
                <MacroItem label="Fat" percent={data.dietPreset?.fat_ratio} totalCal={metrics.targetCalories} color="#FFA500" />
            </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleFinish} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Bắt đầu ngay</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const MacroItem = ({ label, percent, totalCal, color }: any) => {
    const cal = Math.round((totalCal * percent) / 100);
    const gram = label === 'Fat' ? Math.round(cal / 9) : Math.round(cal / 4);
    
    return (
        <View style={styles.macroItem}>
            <Text style={{color, fontWeight: 'bold', fontSize: 16}}>{percent}%</Text>
            <Text style={{fontSize: 14}}>{label}</Text>
            <Text style={{fontSize: 12, color: '#666'}}>{gram}g</Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  resultBox: {
      backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20,
      shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, elevation: 5
  },
  calLabel: { fontSize: 16, color: '#666', marginBottom: 10 },
  calNumber: { fontSize: 40, fontWeight: 'bold', color: Colors.primary },
  tdeeLabel: { fontSize: 14, color: '#999', marginTop: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statItem: { flex: 1, backgroundColor: '#fff', margin: 5, padding: 15, borderRadius: 15, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#666' },
  macroBox: { backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  footer: { padding: 20, backgroundColor: '#fff' },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
