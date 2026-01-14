import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService'; // Tự implement tương tự login
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            const res = await authService.register(email, password, name);
            Alert.alert('Thành công', 'Tạo tài khoản thành công. Hãy đăng nhập ngay.');
            router.back(); // Quay lại trang login
        } catch (err: any) {
            console.error("Sign Up Error Details:", err.response ? err.response.data : err); // Log full error for debugging
            Alert.alert('Đăng ký thất bại', err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản mới 🚀</Text>
        </View>
  
        <View style={styles.form}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput 
                style={styles.input} placeholder="Nguyễn Văn A" 
                value={name} onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput 
                style={styles.input} placeholder="example@gmail.com" 
                value={email} onChangeText={setEmail} autoCapitalize="none"
            />
    
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput 
                style={styles.input} placeholder="********" secureTextEntry 
                value={password} onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
                 <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    header: { marginTop: 50, marginBottom: 40 },
    title: { fontSize: 30, fontWeight: 'bold', color: Colors.primary },
    form: { flex: 1 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 15 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
    button: { backgroundColor: Colors.primary, padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 40 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkBtn: { marginTop: 20, alignItems: 'center' },
    linkText: { color: Colors.primary, fontSize: 16 }
  });