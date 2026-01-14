import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Logo Placeholder */}
      <View style={styles.logoContainer}>
        <Text style={{ fontSize: 60 }}>🌿</Text>
      </View>
      
      <Text style={styles.appName}>Healio</Text>
      <Text style={styles.tagline}>
        Sống khỏe mỗi ngày với{'\n'}lộ trình dinh dưỡng cá nhân hóa.
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/auth/sign-up')}
      >
        <Text style={styles.buttonText}>Bắt đầu ngay</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.push('/auth/sign-in')}>
        <Text style={styles.loginText}>Đã có tài khoản? <Text style={{fontWeight: 'bold', color: Colors.primary}}>Đăng nhập</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: Colors.background },
  logoContainer: { width: 120, height: 120, backgroundColor: '#E8F5E9', borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginBottom: 10 },
  tagline: { fontSize: 16, color: Colors.gray, textAlign: 'center', lineHeight: 24, marginBottom: 50 },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, width: '100%', borderRadius: 30, alignItems: 'center', elevation: 2 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: Colors.text, fontSize: 14 },
});