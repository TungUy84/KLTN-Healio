import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { ChevronLeftIcon, ArrowLongRightIcon, CheckCircleIcon } from "react-native-heroicons/solid";
import { EnvelopeIcon } from "react-native-heroicons/outline";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSend = async () => {
        if (!email) {
            Alert.alert('Thông báo', 'Vui lòng nhập email');
            return;
        }

        try {
            setLoading(true);
            await authService.forgotPassword(email);
            router.push({ pathname: '/auth/otp', params: { email, type: 'forgot-password' } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gửi yêu cầu thất bại';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
            <View className="flex-row items-center px-4 pt-2 mb-8">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-4 bg-white rounded-full shadow-sm">
                    <ChevronLeftIcon size={20} color="#111" />
                </TouchableOpacity>
                <View className="flex-1">
                    <View className="items-end">
                        <View className="w-full h-1 bg-gray-200 rounded-full mb-1">
                            <View className="h-1 bg-emerald-500 rounded-full w-1/3" />
                        </View>
                        <Text className="text-[10px] text-emerald-600 font-bold uppercase">Bước 1: Nhập Email</Text>
                    </View>
                </View>
            </View>

            <View className="px-6 items-center">
                <View className="w-20 h-20 rounded-full bg-orange-100 justify-center items-center mb-6 mt-4">
                     <Text className="text-4xl text-orange-500 font-bold">↺</Text> 
                </View>

                <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Quên mật khẩu?</Text>
                <Text className="text-base text-gray-500 text-center mb-8 leading-6">
                    Đừng lo, chuyện này vẫn thường xảy ra. Hãy nhập email của bạn để nhận mã xác thực.
                </Text>

                <View className="w-full">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                    <View className="flex-row items-center w-full bg-white border border-gray-200 rounded-xl px-4 h-14 mb-6 focus:border-emerald-500">
                        <EnvelopeIcon size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                        <TextInput 
                            className="flex-1 text-base text-gray-900 h-full"
                            placeholder="user@example.com"
                            placeholderTextColor="#9CA3AF"
                            value={email} 
                            onChangeText={setEmail} 
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        {email.length > 5 && email.includes('@') && (
                            <CheckCircleIcon size={20} color="#10b981" />
                        )}
                    </View>

                    <TouchableOpacity 
                        className="w-full bg-emerald-500 h-14 rounded-xl justify-center items-center shadow-lg shadow-emerald-200 mb-6"
                        onPress={handleSend}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View className="flex-row items-center">
                                <Text className="text-white text-lg font-bold mr-2">Gửi mã OTP</Text>
                                <ArrowLongRightIcon size={20} color="#fff"/>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} className="mt-4">
                        <Text className="text-center text-gray-500 text-sm font-medium">Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}