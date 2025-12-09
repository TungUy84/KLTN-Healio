import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ChevronRightIcon } from "react-native-heroicons/outline";

export default function Step3Body() {
  const params = useLocalSearchParams();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = () => {
    if (!height || !weight) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Chiều cao và Cân nặng.");
      return;
    }
    router.push({ 
      pathname: '/onboarding/step4-active', 
      params: { ...params, height, weight } 
    } as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '75%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Bước 3/4</Text>
        <Text style={styles.heading}>Chỉ số cơ thể</Text>
        <Text style={styles.subHeading}>Hãy nhập chính xác để Healio tính BMI và TDEE cho bạn.</Text>

        <View style={styles.row}>
          {/* Chiều cao */}
          <View style={styles.col}>
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput 
              style={styles.input}
              placeholder="170"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />
          </View>

          {/* Cân nặng */}
          <View style={styles.col}>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput 
              style={styles.input}
              placeholder="65"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              maxLength={3}
            />
          </View>
        </View>

        {/* Mẹo nhỏ */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Mẹo nhỏ</Text>
          <Text style={styles.tipText}>Nên cân vào buổi sáng, sau khi thức dậy và chưa ăn gì để có số liệu chuẩn nhất.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnNext} onPress={handleNext}>
          <Text style={styles.btnText}>Tiếp tục</Text>
          <ChevronRightIcon size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  progressContainer: { height: 4, backgroundColor: '#F0F0F0', width: '100%' },
  progressBar: { height: '100%', backgroundColor: Colors.primary },
  content: { padding: 20 },
  step: { color: Colors.primary, fontWeight: 'bold', marginBottom: 5 },
  heading: { fontSize: 26, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  subHeading: { fontSize: 16, color: Colors.gray, marginBottom: 30 },
  
  row: { flexDirection: 'row', gap: 15 },
  col: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 18, fontSize: 20, backgroundColor: '#FAFAFA', textAlign: 'center', color: Colors.text, fontWeight: 'bold' },

  tipBox: { marginTop: 30, backgroundColor: '#FFF8E1', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#FFECB3' },
  tipTitle: { fontWeight: 'bold', color: '#FF9800', marginBottom: 5 },
  tipText: { color: '#5D4037', fontSize: 14, lineHeight: 20 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  btnNext: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
});