import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ChevronRightIcon } from "react-native-heroicons/outline";

export default function Step1Goal() {
  const [goal, setGoal] = useState('lose_weight'); // lose_weight, maintain, gain_weight

  const handleNext = () => {
    // Truyền mục tiêu sang bước sau
    router.push({
      pathname: '/onboarding/step2-info',
      params: { goal }
    } as any); // <--- Thêm "as any" vào đây
  };
  const GoalCard = ({ id, icon, title, desc }: any) => {
    const isSelected = goal === id;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setGoal(id)}
      >
        <Text style={{ fontSize: 32, marginRight: 15 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, isSelected && styles.textSelected]}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>
        <View style={[styles.radio, isSelected && styles.radioSelected]} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '25%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Bước 1/4</Text>
        <Text style={styles.heading}>Mục tiêu của bạn là gì?</Text>
        <Text style={styles.subHeading}>Healio sẽ điều chỉnh thực đơn dựa trên lựa chọn này.</Text>

        <GoalCard id="lose_weight" icon="📉" title="Giảm cân" desc="Giảm mỡ, thâm hụt calo lành mạnh" />
        <GoalCard id="maintain" icon="⚖️" title="Duy trì cân nặng" desc="Sống khỏe, cân bằng dinh dưỡng" />
        <GoalCard id="gain_weight" icon="💪" title="Tăng cân" desc="Tăng cơ, tăng cường năng lượng" />
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

  card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EEE', marginBottom: 15, backgroundColor: '#FAFAFA' },
  cardSelected: { borderColor: Colors.primary, backgroundColor: '#E8F5E9' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  textSelected: { color: Colors.primary },
  cardDesc: { fontSize: 13, color: Colors.gray },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCC' },
  radioSelected: { borderColor: Colors.primary, borderWidth: 7 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  btnNext: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
});