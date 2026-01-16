import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from "react-native-heroicons/outline";

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
  
    // Calculate Password Strength
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 4) score++;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strengthScore = getStrength(password);
    
    // Helper to get Color based on score
    const getBarColor = (index: number) => {
        if (index >= strengthScore) return 'bg-gray-200'; // Empty
        if (strengthScore <= 2) return 'bg-orange-500'; // Weak/Medium
        return 'bg-emerald-500'; // Strong (Green)
    };

    const getStrengthText = () => {
        switch(strengthScore) {
            case 0: return 'Chưa nhập';
            case 1: return 'Yếu';
            case 2: return 'Trung bình';
            case 3: return 'Khá';
            case 4: return 'Mạnh';
            default: return '';
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
            return;
        }
        try {
            setLoading(true);
            await authService.register(email, password, email.split('@')[0]); // Use part of email as name
            Alert.alert('Thành công', 'OTP đã được gửi.');
            router.push({ pathname: '/auth/otp', params: { email, type: 'register' } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Đăng ký thất bại';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6">
            
            <View className="mt-6 mb-8">
                <TouchableOpacity onPress={() => router.back()} className="self-start p-2 -ml-2 mb-4 rounded-full active:bg-gray-100">
                     <ArrowLeftIcon size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</Text>
                <Text className="text-base text-gray-500">Bắt đầu hành trình dinh dưỡng của bạn cùng Healio</Text>
            </View>
    
            <View className="w-full">
                
                <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                <View className="flex-row items-center w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-14 mb-4 focus:border-emerald-500">
                    <EnvelopeIcon size={20} color="#9CA3AF" style={{marginRight: 10}} />
                    <TextInput 
                        className="flex-1 text-base text-gray-900 h-full"
                        placeholder="nhập địa chỉ email"
                        placeholderTextColor="#9CA3AF"
                        value={email} 
                        onChangeText={setEmail} 
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu</Text>
                <View className="flex-row items-center w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-14 mb-2 focus:border-emerald-500">
                     <LockClosedIcon size={20} color="#9CA3AF" style={{marginRight: 10}} />
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
                            <EyeIcon size={20} color="#6B7280" /> : 
                            <EyeSlashIcon size={20} color="#6B7280" />
                        }
                    </TouchableOpacity>
                </View>

                {/* Password Strength Bar */}
                <View className="flex-row mt-2 mb-2 gap-1.5 h-1">
                    {[0, 1, 2, 3].map((i) => (
                        <View key={i} className={`flex-1 rounded-full h-1 ${getBarColor(i)}`} />
                    ))}
                </View>
                <View className="flex-row justify-between mb-6">
                    <Text className={`text-xs font-medium ${strengthScore > 2 ? 'text-emerald-500' : 'text-orange-500'}`}>
                        ● Độ mạnh: {getStrengthText()}
                    </Text>
                    <Text className="text-gray-400 text-xs">Ít nhất 8 ký tự</Text>
                </View>

                 <Text className="text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</Text>
                 <View className="flex-row items-center w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-14 mb-6 focus:border-emerald-500">
                     <View className="w-5 mr-2.5" /> 
                     {/* Space for icon alignment */}
                     <TextInput 
                        className="flex-1 text-base text-gray-900 h-full"
                        placeholder="nhập lại mật khẩu"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                    />
                    <EyeSlashIcon size={20} color="#9CA3AF" />
                 </View>

                {/* Register Button - EMERALD for consistency */}
                <TouchableOpacity 
                    className="w-full bg-emerald-500 h-14 rounded-xl justify-center items-center shadow-lg shadow-emerald-200 mb-8"
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-bold">Đăng ký</Text>}
                </TouchableOpacity>

                <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-[1px] bg-gray-200" />
                    <Text className="mx-4 text-gray-400 text-xs font-medium">hoặc đăng ký với</Text>
                    <View className="flex-1 h-[1px] bg-gray-200" />
                </View>

                <View className="flex-row justify-between gap-4 mb-8">
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center h-12 border border-gray-200 rounded-xl bg-white">
                        <Text className="text-lg font-bold text-red-500 mr-2">G</Text>
                        <Text className="font-medium text-gray-900">Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 flex-row items-center justify-center h-12 border border-gray-200 rounded-xl bg-white">
                        <Text className="text-lg font-bold text-black mr-2"></Text>
                        <Text className="font-medium text-gray-900">Apple</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-center mb-10">
                     <Text className="text-gray-500 text-sm">Bạn đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
                        <Text className="text-orange-500 font-bold text-sm">Đăng nhập</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}