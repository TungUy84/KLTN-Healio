import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors } from '../../constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker'; 

export default function Step1Info() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Mặc định dob là 2000 nếu chưa set
  const dob = data.dob || new Date(2000, 0, 1);

  const handleNext = () => {
    if (!data.full_name) {
       alert('Vui lòng nhập họ tên');
       return;
    }
    router.push('/onboarding/step2-body');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Bước 1/4</Text>
        <Text style={styles.title}>Thông tin cơ bản</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput 
          style={styles.input}
          placeholder="Nhập họ tên của bạn"
          value={data.full_name}
          onChangeText={(text) => updateData({ full_name: text })}
        />

        <Text style={styles.label}>Giới tính</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, data.gender === 'male' && styles.selected]}
            onPress={() => updateData({ gender: 'male' })}
          >
            <Text style={[styles.genderText, data.gender === 'male' && styles.selectedText]}>Nam</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, data.gender === 'female' && styles.selected]}
            onPress={() => updateData({ gender: 'female' })}
          >
            <Text style={[styles.genderText, data.gender === 'female' && styles.selectedText]}>Nữ</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Ngày sinh</Text>
        {/* Date Picker Logic */}
         <View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Text style={{fontSize: 16}}>{dob.toLocaleDateString('vi-VN')}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    updateData({ dob: selectedDate });
                  }
                }}
                maximumDate={new Date()}
              />
            )}
         </View>
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
  header: { padding: 20 },
  stepIndicator: { color: Colors.primary, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#f9f9f9'
  },
  genderContainer: { flexDirection: 'row', gap: 15 },
  genderButton: {
    flex: 1, padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, alignItems: 'center'
  },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  genderText: { fontSize: 16 },
  selectedText: { color: '#fff', fontWeight: 'bold' },
  dateButton: {
      padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, alignItems: 'center'
  },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
