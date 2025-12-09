import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function CalculatingScreen() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState('Đang phân tích dữ liệu...');

  useEffect(() => {
    // 1. Giả lập tính toán
    const performCalculation = async () => {
      
      // Bước 1: Phân tích
      setTimeout(() => setStatus('Đang tính chỉ số BMI & BMR...'), 1000);

      // Bước 2: Tính toán (Mifflin-St Jeor)
      setTimeout(() => {
        setStatus('Đang thiết lập mục tiêu Calo...');
        
        // --- LOGIC TÍNH TOÁN (Giả lập lưu vào DB) ---
        // const weight = parseFloat(params.weight as string);
        // const height = parseFloat(params.height as string);
        // const age = parseFloat(params.age as string);
        // ... Code tính toán sẽ nằm ở đây hoặc Backend
        // ---------------------------------------------

      }, 2500);

      // Bước 3: Hoàn tất & Chuyển hướng
      setTimeout(() => {
        // replace: Thay thế màn hình hiện tại để user không back lại được
        router.replace('/(tabs)' as any); 
      }, 4000);
    };

    performCalculation();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 30 }} />
      <Text style={styles.title}>Đang thiết lập lộ trình...</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  status: { fontSize: 16, color: Colors.gray },
});