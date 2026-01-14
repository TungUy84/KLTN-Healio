import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors } from '../../constants/Colors';
import { userService } from '../../services/userService';

export default function Step4Diet() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
        setLoading(true);
        const res = await userService.getDietPresets();
        setPresets(res);
    } catch (err) {
        console.log('Load presets failed', err);
        // Fallback data nếu API lỗi
        setPresets([
            { code: 'balanced', name: 'Balanced', description: 'Cân bằng (Khuyên dùng)', carb_ratio: 45, protein_ratio: 30, fat_ratio: 25 },
            { code: 'high_protein', name: 'High Protein', description: 'Giảm mỡ, tăng cơ', carb_ratio: 40, protein_ratio: 35, fat_ratio: 25 },
        ]);
    } finally {
        setLoading(false);
    }
  };

  const handleSelect = (preset: any) => {
    updateData({ dietPreset: preset });
  };

  const handleNext = () => {
    if (!data.dietPreset) {
        alert('Vui lòng chọn 1 chế độ ăn');
        return;
    }
    router.push('/onboarding/result');
  };

  const isRecommend = (code: string) => {
      // Logic gợi ý sơ khai
      if (data.goalType === 'lose_weight' && code === 'high_protein') return true;
      if (data.goalType === 'gain_weight' && code === 'high_carb') return true;
      if (code === 'balanced') return true;
      return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.stepIndicator}>Bước 4/4</Text>
          <Text style={styles.title}>Chọn chế độ ăn</Text>
          <Text style={styles.subtitle}>Tỷ lệ dinh dưỡng sẽ được tính theo chế độ này</Text>
      </View>

      {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {presets.map((preset) => (
                <TouchableOpacity 
                    key={preset.code}
                    style={[
                        styles.card, 
                        data.dietPreset?.code === preset.code && styles.selectedCard
                    ]}
                    onPress={() => handleSelect(preset)}
                >
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, data.dietPreset?.code === preset.code && styles.selectedText]}>
                            {preset.name}
                        </Text>
                        {isRecommend(preset.code) && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Gợi ý</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.cardDesc, data.dietPreset?.code === preset.code && styles.selectedDesc]}>
                        {preset.description}
                    </Text>
                    <View style={styles.macros}>
                        <Text style={styles.macroTag}>🥩 {preset.protein_ratio}% Protein</Text>
                        <Text style={styles.macroTag}>🍞 {preset.carb_ratio}% Carb</Text>
                        <Text style={styles.macroTag}>🥑 {preset.fat_ratio}% Fat</Text>
                    </View>
                </TouchableOpacity>
            ))}
          </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Xem kết quả</Text>
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
  subtitle: { color: '#666' },
  content: { padding: 20, paddingTop: 0 },
  card: {
      padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, backgroundColor: '#fff'
  },
  selectedCard: {
      borderColor: Colors.primary, backgroundColor: Colors.primary,
      shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 10 },
  selectedText: { color: '#fff' },
  selectedDesc: { color: '#eee' },
  badge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  macros: { flexDirection: 'row', gap: 10 },
  macroTag: { fontSize: 12, backgroundColor: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 4, overflow: 'hidden', color: '#333' },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
