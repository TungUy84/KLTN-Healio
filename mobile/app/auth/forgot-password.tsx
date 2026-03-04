import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
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

                            {/* Icon trang trí: Ổ khóa */}
                            <Animated.View entering={FadeInDown.delay(100).springify()} className="w-24 h-24 bg-white/80 rounded-[32px] items-center justify-center mb-8 border border-white shadow-xl shadow-orange-100/50">
                                <View className="w-16 h-16 bg-orange-50 rounded-2xl items-center justify-center">
                                    <Ionicons name="lock-open-outline" size={32} color="#f97316" />
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(200).springify()} className="w-full mb-10">
                                <Text className="text-[28px] font-black text-slate-800 mb-2 text-center tracking-tight">Quên mật khẩu?</Text>
                                <Text className="text-[15px] font-medium text-slate-500 text-center leading-6">
                                    Đừng lo, chuyện này vẫn thường xảy ra.{'\n'}
                                    Hãy nhập email để nhận mã xác thực đặt lại mật khẩu.
                                </Text>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(300).springify()} className="w-full gap-2 mb-8">
                                <Text className="text-slate-700 font-bold ml-1 text-sm tracking-tight">Email đăng ký</Text>

                                {/* Input Email */}
                                <View className={`flex-row items-center border rounded-[20px] px-4 h-14 bg-white/60 transition-colors shadow-sm ${email && email.includes('@') ? 'border-emerald-500 bg-white shadow-emerald-100' : 'border-slate-200 focus:border-emerald-500 focus:bg-white shadow-slate-100'}`}>
                                    <Ionicons name="mail-outline" size={20} color={email && email.includes('@') ? "#10b981" : "#94a3b8"} />
                                    <TextInput
                                        className="flex-1 ml-3 text-[16px] font-medium text-slate-800 h-full"
                                        placeholder="user@example.com"
                                        placeholderTextColor="#94a3b8"
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
                            </Animated.View>

                            {/* Nút Gửi */}
                            <Animated.View entering={FadeInDown.delay(400).springify()} className="w-full">
                                <Pressable
                                    className={`w-full h-14 rounded-full justify-center items-center shadow-lg active:scale-[0.98] transition-all ${loading ? 'bg-slate-300 shadow-transparent' : 'bg-emerald-500 shadow-emerald-500/30 active:opacity-80'}`}
                                    onPress={handleSend}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <View className="flex-row items-center">
                                            <Text className="text-white text-[17px] font-bold tracking-wide mr-2">Gửi mã OTP</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                                        </View>
                                    )}
                                </Pressable>
                            </Animated.View>

                            {/* Nút Quay lại Login */}
                            <Animated.View entering={FadeInDown.delay(500).springify()} className="w-full">
                                <Pressable onPress={() => router.back()} className="mt-8 p-2 active:opacity-60">
                                    <Text className="text-center text-slate-500 text-sm font-medium">Quay lại <Text className="text-emerald-600 font-bold">Đăng nhập</Text></Text>
                                </Pressable>
                            </Animated.View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}