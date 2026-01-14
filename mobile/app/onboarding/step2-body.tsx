import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors } from '../../constants/Colors';

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít tập luyện' },
  { key: 'light', label: 'Nhẹ', desc: 'Tập 1-3 ngày/tuần' },
  { key: 'moderate', label: 'Trung bình', desc: 'Tập 3-5 ngày/tuần' },
  { key: 'active', label: 'Năng động', desc: 'Tập 6-7 ngày/tuần' },
  { key: 'very_active', label: 'Rất năng động', desc: 'Vận động viên, lao động nặng' },
];

export default function Step2Body() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const handleNext = () => {
    if (!data.height || !data.weight) {
      alert('Vui lòng nhập chiều cao và cân nặng');
      return;
    }
    router.push('/onboarding/step3-goal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.stepIndicator}>Bước 2/4</Text>
          <Text style={styles.title}>Chỉ số cơ thể</Text>
          <Text style={styles.subtitle}>Để tính được BMI và TDEE chính xác</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
            <View style={styles.col}>
                <Text style={styles.label}>Chiều cao (cm)</Text>
                <TextInput 
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="VD: 170"
                  value={data.height}
                  onChangeText={(text) => updateData({ height: text })}
                />
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>Cân nặng (kg)</Text>
                <TextInput 
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="VD: 65"
                  value={data.weight}
                  onChangeText={(text) => updateData({ weight: text })}
                />
            </View>
        </View>

        <Text style={styles.label}>Mức độ vận động</Text>
        {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity 
              key={level.key}
              style={[styles.activityOption, data.activityLevel === level.key && styles.selected]}
              onPress={() => updateData({ activityLevel: level.key as any })}
            >
                <Text style={[styles.activityLabel, data.activityLevel === level.key && styles.selectedText]}>
                    {level.label}
                </Text>
                <Text style={[styles.activityDesc, data.activityLevel === level.key && styles.selectedDesc]}>
                    {level.desc}
                </Text>
            </TouchableOpacity>
        ))}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingBottom: 10 },
  stepIndicator: { color: Colors.primary, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 5 },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
  row: { flexDirection: 'row', gap: 15 },
  col: { flex: 1 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 18, textAlign: 'center', backgroundColor: '#f9f9f9'
  },
  activityOption: {
      padding: 15, 
      borderWidth: 1, 
      borderColor: '#ddd', 
      borderRadius: 12, 
      marginBottom: 10,
      backgroundColor: '#fff'
  },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  activityLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  activityDesc: { fontSize: 14, color: '#666' },
  selectedText: { color: '#fff' },
  selectedDesc: { color: '#eee' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
