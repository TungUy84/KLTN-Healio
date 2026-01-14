import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors } from '../../constants/Colors';

export default function Step3Goal() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  const currentW = parseFloat(data.weight || '0');
  const targetW = parseFloat(data.goalWeight || '0');

  // Auto detect goal type
  useEffect(() => {
    if (targetW > 0 && currentW > 0) {
        if (targetW < currentW) updateData({ goalType: 'lose_weight' });
        else if (targetW > currentW) updateData({ goalType: 'gain_weight' });
        else updateData({ goalType: 'maintain' });
    }
  }, [data.goalWeight]);

  const handleNext = () => {
    if (!data.goalWeight) {
        alert('Vui lòng nhập cân nặng mục tiêu');
        return;
    }
    router.push('/onboarding/step4-diet');
  };

  const getReason = () => {
      if (data.goalType === 'lose_weight') return 'Bạn muốn giảm cân 🔥';
      if (data.goalType === 'gain_weight') return 'Bạn muốn tăng cân 💪';
      return 'Bạn muốn giữ dáng 🧘';
  };

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
          <Text style={styles.stepIndicator}>Bước 3/4</Text>
          <Text style={styles.title}>Mục tiêu của bạn</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
            <Text style={styles.currentLabel}>Cân nặng hiện tại: {data.weight} kg</Text>
        </View>

        <Text style={styles.label}>Cân nặng mong muốn (kg)</Text>
        <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="VD: 60"
            value={data.goalWeight}
            onChangeText={(text) => updateData({ goalWeight: text })}
            autoFocus
        />

        {data.goalWeight ? (
             <View style={styles.detectBox}>
                 <Text style={styles.detectText}>{getReason()}</Text>
             </View>
        ) : null}
      </View>

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
  header: { padding: 20 },
  stepIndicator: { color: Colors.primary, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: 20, flex: 1 },
  card: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 20 },
  currentLabel: { fontSize: 16, textAlign: 'center' },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 15, textAlign: 'center' },
  input: {
      fontSize: 40, fontWeight: 'bold', color: Colors.primary, textAlign: 'center',
      borderBottomWidth: 2, borderBottomColor: Colors.primary, padding: 10, marginHorizontal: 50
  },
  detectBox: { marginTop: 30, alignItems: 'center' },
  detectText: { fontSize: 18, color: '#666', fontWeight: '500' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
