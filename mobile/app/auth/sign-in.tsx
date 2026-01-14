import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    try {
        setLoading(true);
        const data = await authService.login(email, password);
        // Save Token
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));

        // Navigate
        router.replace('/(tabs)');
    } catch (err: any) {
        Alert.alert('Đăng nhập thất bại', err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
            style={styles.input} 
            placeholder="example@gmail.com" 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput 
            style={styles.input} 
            placeholder="********" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/sign-up')} style={styles.linkBtn}>
            <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { marginTop: 50, marginBottom: 40 },
  title: { fontSize: 30, fontWeight: 'bold', color: Colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
  form: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, fontSize: 16, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: Colors.primary, padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 40 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: Colors.primary, fontSize: 16 }
});
