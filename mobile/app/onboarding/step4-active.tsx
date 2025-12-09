import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ChevronRightIcon } from "react-native-heroicons/outline";

export default function Step4Active() {
  const params = useLocalSearchParams();
  const [activity, setActivity] = useState(1.2); // PAL mặc định (Ít vận động)

  const handleFinish = () => {
    // Chuyển sang màn hình tính toán
    router.push({ 
      pathname: '/onboarding/calculating', 
      params: { ...params, activity } 
    } as any);
  };

  const Option = ({ pal, icon, title, desc }: any) => {
    const isSelected = activity === pal;
    return (
      <TouchableOpacity 
        style={[styles.card, isSelected && styles.cardSelected]} 
        onPress={() => setActivity(pal)}
      >
        <View style={styles.iconBox}><Text style={{fontSize: 24}}>{icon}</Text></View>
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
        <View style={[styles.progressBar, { width: '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Bước 4/4</Text>
        <Text style={styles.heading}>Mức độ vận động</Text>
        <Text style={styles.subHeading}>Giúp chúng tôi xác định lượng calo bạn tiêu hao mỗi ngày.</Text>

        <Option pal={1.2} icon="💻" title="Ít vận động" desc="Làm việc văn phòng, ít đi lại, không tập luyện." />
        <Option pal={1.375} icon="🚶" title="Vận động nhẹ" desc="Tập thể dục nhẹ 1-3 ngày/tuần." />
        <Option pal={1.55} icon="🏃" title="Vận động vừa" desc="Tập thể dục 3-5 ngày/tuần." />
        <Option pal={1.725} icon="🏋️" title="Năng động" desc="Tập cường độ cao 6-7 ngày/tuần." />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnNext} onPress={handleFinish}>
          <Text style={styles.btnText}>Hoàn tất</Text>
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
  
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEE', marginBottom: 12, backgroundColor: '#FAFAFA' },
  cardSelected: { borderColor: Colors.primary, backgroundColor: '#E8F5E9' },
  iconBox: { width: 40, alignItems: 'center', marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  textSelected: { color: Colors.primary },
  cardDesc: { fontSize: 13, color: Colors.gray },
  
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCC' },
  radioSelected: { borderColor: Colors.primary, borderWidth: 7 },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  btnNext: { backgroundColor: Colors.secondary, paddingVertical: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
});