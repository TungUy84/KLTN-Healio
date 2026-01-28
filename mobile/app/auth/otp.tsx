import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, StatusBar, Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons'; // Dùng Ionicons cho đồng bộ

export default function OtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { email, type } = params;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(105); // 1 phút 45 giây
    const inputRef = useRef<TextInput>(null);

    // Timer đếm ngược
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

    // Xử lý xác thực OTP
    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Thông báo', 'Vui lòng nhập mã OTP hợp lệ (6 số)');
            return;
        }

        try {
            setLoading(true);

            if (type === 'register') {
                // Case 1: Kích hoạt tài khoản đăng ký
                await authService.verifyRegisterOtp(email as string, otp);

                // Chuyển hướng sang Onboarding
                router.replace('/onboarding');

            } else if (type === 'forgot-password') {
                // Case 2: Xác thực để đặt lại mật khẩu
                await authService.verifyResetOtp(email as string, otp);

                // Chuyển sang màn hình đặt lại mật khẩu
                router.push({ pathname: '/auth/reset-password', params: { email, otp } });
            } else {
                Alert.alert('Lỗi', 'Loại xác thực không hợp lệ');
            }

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Mã xác thực không đúng';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý gửi lại mã
    const handleResend = async () => {
        if (timeLeft > 0) return;
        try {
            setTimeLeft(120);
            // Gọi API gửi lại OTP
            await authService.resendOtp(email as string, type as 'register' | 'forgot-password');

            Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi vào email của bạn.');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Không thể gửi lại mã OTP';
            Alert.alert('Lỗi', msg);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">

                {/* Header: Nút Back */}
                <View className="px-6 py-2">
                    <Pressable onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </Pressable>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

                        <View className="flex-1 px-6 items-center pt-6">

                            {/* Icon trang trí */}
                            <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-6">
                                <Ionicons name="shield-checkmark-outline" size={40} color="#10b981" />
                            </View>

                            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Xác thực tài khoản</Text>
                            <Text className="text-base text-gray-500 text-center mb-10 leading-6 px-4">
                                Vui lòng nhập mã 6 số chúng tôi vừa gửi tới email{'\n'}
                                <Text className="font-bold text-gray-900">{email}</Text>
                            </Text>

                            {/* Ô Nhập OTP */}
                            <View className="w-full items-center mb-8 h-16 justify-center">
                                <TextInput
                                    ref={inputRef}
                                    className="absolute w-full h-full opacity-0 z-10"
                                    value={otp}
                                    onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                />

                                <View className="flex-row justify-between w-full gap-2">
                                    {[0, 1, 2, 3, 4, 5].map((index) => {
                                        const isActive = otp.length === index;
                                        const isFilled = otp.length > index;

                                        return (
                                            <Pressable
                                                key={index}
                                                onPress={() => inputRef.current?.focus()}
                                                className={`flex-1 h-14 border rounded-xl justify-center items-center transition-all ${isActive ? 'border-emerald-500 border-2 bg-white' :
                                                        isFilled ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                <Text className={`text-2xl font-bold ${isFilled || isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    {otp[index] || ''}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Timer */}
                            <Text className="text-sm text-gray-500 mb-8">
                                Mã có hiệu lực trong <Text className="text-orange-500 font-bold">{formatTime(timeLeft)}</Text>
                            </Text>

                            {/* Nút Xác nhận */}
                            <Pressable
                                className={`w-full h-14 rounded-full justify-center items-center shadow-lg active:scale-[0.98] transition-all ${otp.length === 6 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-gray-300'
                                    }`}
                                onPress={handleVerify}
                                disabled={loading || otp.length < 6}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Xác nhận</Text>
                                )}
                            </Pressable>

                            {/* Gửi lại mã */}
                            <Pressable
                                className="mt-8 p-4"
                                onPress={handleResend}
                                disabled={timeLeft > 0}
                            >
                                <Text className={`text-sm text-center ${timeLeft > 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Bạn chưa nhận được mã? <Text className={`font-bold ${timeLeft > 0 ? 'text-gray-400' : 'text-emerald-600'}`}>Gửi lại</Text>
                                </Text>
                            </Pressable>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}