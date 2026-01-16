import React, { useState } from 'react';
import { 
  View, Text, TextInput, Pressable, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons'; // Dùng Ionicons chuẩn

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSend = async () => {
        // Validate Email cơ bản
        if (!email) {
            Alert.alert('Thông báo', 'Vui lòng nhập email');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Thông báo', 'Email không đúng định dạng');
            return;
        }

        try {
            setLoading(true);
            await authService.forgotPassword(email);
            // console.log("Sending Reset OTP to:", email);
            
            router.push({ pathname: '/auth/otp', params: { email, type: 'forgot-password' } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gửi yêu cầu thất bại';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <SafeAreaView className="flex-1">
            
            {/* Header: Nút Back */}
            <View className="px-6 py-2">
                <Pressable 
                    onPress={() => router.back()} 
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200"
                >
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </Pressable>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    
                    <View className="flex-1 px-6 items-center pt-4">
                        
                        {/* Icon trang trí: Ổ khóa */}
                        <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center mb-6 border border-orange-100">
                             <Ionicons name="lock-open-outline" size={48} color="#f97316" />
                        </View>

                        <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">Quên mật khẩu?</Text>
                        <Text className="text-base text-gray-500 text-center mb-10 leading-6 px-4">
                            Đừng lo, chuyện này vẫn thường xảy ra.{'\n'}
                            Hãy nhập email để nhận mã xác thực đặt lại mật khẩu.
                        </Text>

                        <View className="w-full gap-2">
                            <Text className="text-gray-700 font-medium ml-1">Email đăng ký</Text>
                            
                            {/* Input Email */}
                            <View className={`flex-row items-center border rounded-2xl px-4 h-14 bg-gray-50 transition-colors ${email && email.includes('@') ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 focus:border-emerald-500'}`}>
                                <Ionicons name="mail-outline" size={20} color={email && email.includes('@') ? "#10b981" : "#9ca3af"} />
                                <TextInput 
                                    className="flex-1 ml-3 text-base text-gray-900 h-full"
                                    placeholder="user@example.com"
                                    placeholderTextColor="#9ca3af"
                                    value={email} 
                                    onChangeText={setEmail} 
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                {/* Icon check xanh khi nhập đúng định dạng */}
                                {email.length > 5 && email.includes('@') && (
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                )}
                            </View>
                        </View>

                        {/* Nút Gửi */}
                        <Pressable 
                            className={`w-full mt-8 h-14 rounded-full justify-center items-center shadow-lg active:scale-[0.98] transition-all ${
                                loading ? 'bg-gray-400' : 'bg-emerald-500 shadow-emerald-500/30'
                            }`}
                            onPress={handleSend}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Text className="text-white text-lg font-bold mr-2">Gửi mã OTP</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff"/>
                                </View>
                            )}
                        </Pressable>

                        {/* Nút Quay lại Login */}
                        <Pressable onPress={() => router.back()} className="mt-8 p-2 active:opacity-60">
                            <Text className="text-center text-gray-500 text-sm font-medium">Quay lại <Text className="text-emerald-600 font-bold">Đăng nhập</Text></Text>
                        </Pressable>
                        
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
}