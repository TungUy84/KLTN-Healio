import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, StatusBar 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { ChevronLeftIcon } from "react-native-heroicons/solid";

export default function OtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { email, type } = params; 

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(105); // 01:45 = 105 seconds
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Thông báo', 'Vui lòng nhập mã OTP hợp lệ (6 số)');
            return;
        }

        try {
            setLoading(true);
            
            if (type === 'register') {
                const data = await authService.verifyRegisterOtp(email as string, otp);
                Alert.alert('Thành công', 'Tài khoản đã được kích hoạt.');
                if (data.user?.is_onboarded) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/onboarding');
                }
            } else if (type === 'forgot-password') {
                await authService.verifyResetOtp(email as string, otp);
                router.push({ pathname: '/auth/reset-password', params: { email, otp } });
            } else {
                 Alert.alert('Lỗi', 'Loại xác thực không hợp lệ');
            }
            
        } catch (err: any) {
             const msg = err.response?.data?.message || 'Xác thực thất bại';
             Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        try {
            setTimeLeft(120); 
            if (type === 'register') {
                 // await authService.resendRegisterOtp(email);
                 Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi (Giả lập).');
            } else if (type === 'forgot-password') {
                 await authService.forgotPassword(email as string);
                 Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi.');
            }
        } catch (err: any) {
            Alert.alert('Lỗi', 'Không thể gửi lại mã OTP');
        }
    }

    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
            <View className="flex-row items-center px-4 pt-2 mb-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-4 bg-white rounded-full shadow-sm">
                    <ChevronLeftIcon size={20} color="#111" />
                </TouchableOpacity>
                <View className="flex-1">
                     <View className="items-end">
                        <View className="w-full h-1 bg-gray-200 rounded-full mb-1">
                            <View className="h-1 bg-emerald-500 rounded-full w-2/3" />
                        </View>
                        <Text className="text-[10px] text-emerald-600 font-bold uppercase">Bước 2: Xác thực</Text>
                     </View>
                </View>
            </View>
    
            <View className="px-6 items-center">
                
                <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Nhập mã xác thực</Text>
                <Text className="text-base text-gray-500 text-center mb-10 leading-6">
                    Nhập mã 6 số chúng tôi vừa gửi tới{'\n'}
                    <Text className="font-bold text-gray-900">{email}</Text>
                </Text>

                <View className="w-full items-center mb-8 h-16 justify-center">
                    <TextInput 
                        ref={inputRef}
                        className="absolute w-full h-full opacity-0 z-10"
                        value={otp}
                        onChangeText={(text) => setOtp(text.slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                        caretHidden
                    />
                    
                    <View className="flex-row justify-between w-full">
                        {[0, 1, 2, 3, 4, 5].map((index) => {
                            const isActive = otp.length === index;
                            const isFilled = otp.length > index;
                            
                            let borderClass = 'border-gray-200';
                            let bgClass = 'bg-white';
                            let textClass = 'text-gray-900';

                            if (isActive) {
                                borderClass = 'border-emerald-500 border-2';
                                textClass = 'text-emerald-500';
                            } else if (isFilled) {
                                borderClass = 'border-emerald-500';
                                bgClass = 'bg-emerald-50';
                                textClass = 'text-gray-900';
                            }

                            return (
                                <Pressable 
                                    key={index} 
                                    onPress={() => inputRef.current?.focus()}
                                    className={`w-12 h-14 border rounded-xl justify-center items-center ${bgClass} ${borderClass}`}
                                >
                                    <Text className={`text-2xl font-bold ${textClass}`}>
                                        {otp[index] || ''}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <Text className="text-sm text-gray-500 mb-8">
                    Mã có hiệu lực trong <Text className="text-orange-500 font-bold">{formatTime(timeLeft)}</Text>
                </Text>

                <TouchableOpacity 
                    className="w-full bg-emerald-500 h-14 rounded-xl justify-center items-center shadow-lg shadow-emerald-200"
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-lg font-bold">Xác nhận</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    className="mt-6 p-2" 
                    onPress={handleResend} 
                    disabled={timeLeft > 0}
                >
                    <Text className={`text-sm ${timeLeft > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                        Bạn chưa nhận được mã? <Text className={`font-bold ${timeLeft > 0 ? 'text-gray-400' : 'text-orange-500'}`}>Gửi lại</Text>
                    </Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}