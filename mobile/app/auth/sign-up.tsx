import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ChevronLeftIcon } from "react-native-heroicons/outline";

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Giả lập đăng ký thành công
    // Ở đây sau này sẽ gọi API đăng ký
    router.push('/onboarding/step1-goal');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ChevronLeftIcon size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Tạo tài khoản</Text>
      <Text style={styles.subtitle}>Bắt đầu hành trình sức khỏe cùng Healio</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="email@example.com" 
          value={email} onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput 
          style={styles.input} 
          placeholder="********" 
          value={password} onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký & Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: Colors.background },
  backBtn: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 5 },
  subtitle: { fontSize: 16, color: Colors.gray, marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: Colors.lightGray },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});