import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { EyeIcon, EyeSlashIcon } from "react-native-heroicons/outline";

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
            return;
        }
        try {
            setLoading(true);
            const data = await authService.login(email, password);
             // Success
            if (data.user?.is_onboarded) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        } catch (err: any) {
             if (err.response?.status === 403 && err.response?.data?.mustVerify) {
                 Alert.alert('Chưa kích hoạt', 'Tài khoản chưa xác thực. OTP đã được gửi.');
                 router.push({ pathname: '/auth/otp', params: { email, type: 'register' } });
                 return;
             }
             const msg = err.response?.data?.message || 'Đăng nhập thất bại';
             Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6">
            
            <View className="items-center mt-10 mb-8">
                <View className="w-20 h-20 bg-emerald-50 rounded-2xl justify-center items-center mb-4 shadow-sm">
                    <Image source={require('../../assets/images/icon.png')} className="w-10 h-10" style={{ tintColor: '#10b981' }} resizeMode="contain" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">Healio</Text>
                <Text className="text-gray-500 text-sm">Chăm sóc sức khỏe mỗi ngày</Text>
                
                <Text className="text-xl font-semibold text-gray-900 mt-8 self-start">Chào mừng bạn quay lại!</Text>
            </View>
    
            <View className="w-full">
                
                <Text className="text-sm font-medium text-gray-700 mb-2 mt-2">Email</Text>
                <TextInput 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 h-14 text-base text-gray-900 mb-4 focus:border-emerald-500"
                    placeholder="nhap_email_cua_ban@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu</Text>
                <View className="flex-row items-center w-full bg-white border border-gray-200 rounded-xl px-4 h-14 mb-2 focus:border-emerald-500">
                    <TextInput 
                        className="flex-1 text-base text-gray-900 h-full"
                        placeholder="••••••••" 
                        placeholderTextColor="#9CA3AF"
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                        {showPassword ? 
                            <EyeIcon size={20} color="#10b981" /> : 
                            <EyeSlashIcon size={20} color="#6B7280" />
                        }
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    className="items-end mb-6"
                    onPress={() => router.push('/auth/forgot-password')}
                >
                    <Text className="text-emerald-600 font-medium text-sm">Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="w-full bg-emerald-500 h-14 rounded-xl justify-center items-center shadow-lg shadow-emerald-200 mb-6"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-bold">Đăng nhập</Text>}
                </TouchableOpacity>

                <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-[1px] bg-gray-200" />
                    <Text className="mx-4 text-gray-400 text-xs font-medium">HOẶC</Text>
                    <View className="flex-1 h-[1px] bg-gray-200" />
                </View>

                <TouchableOpacity 
                    className="w-full bg-white border border-gray-200 h-14 rounded-xl justify-center items-center flex-row mb-8"
                    onPress={() => Alert.alert("Coming soon")}
                >
                    <Text className="text-red-500 text-xl font-bold mr-3">G</Text>
                    <Text className="text-gray-700 text-base font-medium">Đăng nhập bằng Google</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mb-10">
                    <Text className="text-gray-500 text-sm">Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                        <Text className="text-orange-500 font-bold text-sm">Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
