import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable, StatusBar, Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';

// --- BACKGROUND AMBIENT GLOW ---
const AmbientGlowBackground = () => (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <Svg height="100%" width="100%">
            <Defs>
                <SvgRadialGradient id="grad1" cx="0%" cy="0%" rx="60%" ry="60%" fx="0%" fy="0%">
                    <Stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                    <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </SvgRadialGradient>
                <SvgRadialGradient id="grad2" cx="100%" cy="30%" rx="50%" ry="50%" fx="100%" fy="30%">
                    <Stop offset="0%" stopColor="#34D399" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </SvgRadialGradient>
                <SvgRadialGradient id="grad3" cx="0%" cy="80%" rx="55%" ry="55%" fx="0%" fy="80%">
                    <Stop offset="0%" stopColor="#059669" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
        </Svg>
    </View>
);

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
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />
            <SafeAreaView className="flex-1">

                {/* Header: Nút Back */}
                <View className="px-6 py-2 z-10 w-full flex-row">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-11 h-11 bg-white/60 rounded-full items-center justify-center border border-white/80 shadow-sm shadow-slate-200 active:bg-slate-50"
                    >
                        <Ionicons name="arrow-back" size={22} color="#334155" />
                    </Pressable>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

                        <View className="flex-1 px-8 items-center pt-8">

                            {/* Icon trang trí */}
                            <Animated.View entering={FadeInDown.delay(100).springify()} className="w-24 h-24 bg-white/80 rounded-[32px] items-center justify-center mb-8 border border-white shadow-xl shadow-emerald-100/50">
                                <View className="w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center">
                                    <Ionicons name="shield-checkmark-outline" size={32} color="#10b981" />
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(200).springify()} className="w-full mb-10">
                                <Text className="text-[28px] font-black text-slate-800 mb-2 text-center tracking-tight">Xác thực tài khoản</Text>
                                <Text className="text-[15px] font-medium text-slate-500 text-center leading-6">
                                    Vui lòng nhập mã 6 số chúng tôi vừa gửi tới email{'\n'}
                                    <Text className="font-bold text-slate-800">{email}</Text>
                                </Text>
                            </Animated.View>

                            {/* Ô Nhập OTP */}
                            <Animated.View entering={FadeInDown.delay(300).springify()} className="w-full items-center mb-8 h-14 justify-center">
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
                                                className={`flex-1 h-14 border rounded-[16px] justify-center items-center transition-all ${isActive ? 'border-emerald-500 border-2 bg-white shadow-md shadow-emerald-100' :
                                                    isFilled ? 'border-emerald-500 bg-white/90 shadow-sm shadow-emerald-50' : 'border-slate-200 bg-white/60 shadow-sm shadow-slate-100'
                                                    }`}
                                            >
                                                <Text className={`text-[22px] font-black tracking-tighter ${isFilled || isActive ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                    {otp[index] || ''}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </Animated.View>

                            {/* Timer */}
                            <Animated.View entering={FadeInDown.delay(400).springify()} className="w-full items-center mb-8">
                                <Text className="text-[14px] font-medium text-slate-500">
                                    Mã có hiệu lực trong <Text className="text-orange-500 font-bold">{formatTime(timeLeft)}</Text>
                                </Text>
                            </Animated.View>

                            {/* Nút Xác nhận */}
                            <Animated.View entering={FadeInDown.delay(500).springify()} className="w-full">
                                <Pressable
                                    className={`w-full h-14 rounded-full justify-center items-center shadow-lg active:scale-[0.98] transition-all ${otp.length === 6 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-300 shadow-transparent'
                                        }`}
                                    onPress={handleVerify}
                                    disabled={loading || otp.length < 6}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-white text-[17px] font-bold tracking-wide">Xác nhận</Text>
                                    )}
                                </Pressable>
                            </Animated.View>

                            {/* Gửi lại mã */}
                            <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full">
                                <Pressable
                                    className="mt-6 p-4 active:opacity-60"
                                    onPress={handleResend}
                                    disabled={timeLeft > 0}
                                >
                                    <Text className={`text-sm text-center font-medium ${timeLeft > 0 ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Bạn chưa nhận được mã? <Text className={`font-bold ${timeLeft > 0 ? 'text-slate-400' : 'text-emerald-600'}`}>Gửi lại</Text>
                                    </Text>
                                </Pressable>
                            </Animated.View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}