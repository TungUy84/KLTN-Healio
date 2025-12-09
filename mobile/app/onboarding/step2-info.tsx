import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ChevronRightIcon, ChevronLeftIcon } from "react-native-heroicons/outline";

export default function Step2Info() {
  const params = useLocalSearchParams(); // Lấy mục tiêu từ bước 1
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');

  const handleNext = () => {
    if (!age) {
      Alert.alert("Chưa nhập tuổi", "Vui lòng nhập tuổi của bạn để tính toán chính xác.");
      return;
    }
    // Truyền tiếp dữ liệu sang bước 3
    router.push({
      pathname: '/onboarding/step3-body',
      params: { ...params, gender, age }
    } as any); // <--- Thêm "as any" vào đây là hết lỗi đỏ    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '50%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>Bước 2/4</Text>
        <Text style={styles.heading}>Thông tin cá nhân</Text>
        <Text style={styles.subHeading}>Giới tính và tuổi tác ảnh hưởng lớn đến mức độ trao đổi chất.</Text>

        {/* Chọn Giới tính */}
        <Text style={styles.label}>Giới tính sinh học</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[styles.genderBox, gender === 'male' && styles.genderActive]}
            onPress={() => setGender('male')}
          >
            <Text style={{ fontSize: 40 }}>👨</Text>
            <Text style={[styles.genderText, gender === 'male' && styles.textActive]}>Nam</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderBox, gender === 'female' && styles.genderActive]}
            onPress={() => setGender('female')}
          >
            <Text style={{ fontSize: 40 }}>👩</Text>
            <Text style={[styles.genderText, gender === 'female' && styles.textActive]}>Nữ</Text>
          </TouchableOpacity>
        </View>

        {/* Nhập Tuổi */}
        <Text style={styles.label}>Tuổi của bạn</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 22"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          maxLength={3}
        />
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

  label: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 10, marginTop: 10 },
  genderRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  genderBox: { flex: 1, alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FAFAFA' },
  genderActive: { borderColor: Colors.primary, backgroundColor: '#E8F5E9' },
  genderText: { marginTop: 8, fontWeight: '600', color: Colors.gray, fontSize: 16 },
  textActive: { color: Colors.primary },

  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 18, fontSize: 18, backgroundColor: '#FAFAFA', color: Colors.text },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  btnNext: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
});