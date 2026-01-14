import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chào mừng đến với Nutrition App</Text>
        <Text style={styles.subtitle}>
          Hãy thiết lập hồ sơ để chúng tôi có thể xây dựng lộ trình dinh dưỡng phù hợp nhất cho bạn.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/onboarding/step1-info')}
        >
          <Text style={styles.buttonText}>Bắt đầu ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
