import React, { useState } from 'react';
import {
    View, Text, TextInput, Pressable,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email, otp } = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation States
    const hasMinLength = password.length >= 8;
    const hasLettersAndNumbers = /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu mới');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (!hasMinLength || !hasLettersAndNumbers) {
            Alert.alert('Lỗi', 'Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại yêu cầu.');
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword(email as string, otp as string, password);
            console.log("Resetting password for", email, "with OTP", otp);

            Alert.alert(
                'Thành công',
                'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
                [{ text: 'OK', onPress: () => router.replace('/auth/sign-in') }]
            );

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Đặt lại mật khẩu thất bại';
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

                {/* Header: Back Button */}
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

                            {/* Icon Chìa khóa */}
                            <Animated.View entering={FadeInDown.delay(100).springify()} className="w-24 h-24 bg-white/80 rounded-[32px] items-center justify-center mb-8 border border-white shadow-xl shadow-emerald-100/50">
                                <View className="w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center">
                                    <Ionicons name="key-outline" size={32} color="#10b981" />
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(200).springify()} className="w-full mb-10">
                                <Text className="text-[28px] font-black text-slate-800 mb-2 text-center tracking-tight">Tạo mật khẩu mới</Text>
                                <Text className="text-[15px] font-medium text-slate-500 text-center leading-6">
                                    Vui lòng nhập mật khẩu mới khác với mật khẩu cũ để đảm bảo an toàn.
                                </Text>
                            </Animated.View>

                            <View className="w-full gap-5">

                                {/* Mật khẩu mới */}
                                <Animated.View entering={FadeInDown.delay(300).springify()}>
                                    <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Mật khẩu mới</Text>
                                    <View className="flex-row items-center border border-slate-200 rounded-[20px] px-4 h-14 bg-white/60 focus:border-emerald-500 focus:bg-white shadow-sm shadow-slate-100 transition-colors">
                                        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                                        <TextInput
                                            className="flex-1 ml-3 text-slate-800 text-[16px] font-medium h-full"
                                            placeholder="••••••••"
                                            placeholderTextColor="#94a3b8"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                                        </Pressable>
                                    </View>
                                </Animated.View>

                                {/* Nhập lại mật khẩu */}
                                <Animated.View entering={FadeInDown.delay(400).springify()}>
                                    <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Nhập lại mật khẩu</Text>
                                    <View className={`flex-row items-center w-full border rounded-[20px] px-4 h-14 bg-white/60 transition-colors shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-red-400 shadow-red-100' : 'border-slate-200 focus:border-emerald-500 focus:bg-white shadow-slate-100'}`}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color={confirmPassword && password !== confirmPassword ? "#ef4444" : "#94a3b8"} />
                                        <TextInput
                                            className="flex-1 ml-3 text-slate-800 text-[16px] font-medium h-full"
                                            placeholder="••••••••"
                                            placeholderTextColor="#94a3b8"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2 -mr-2">
                                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                                        </Pressable>
                                    </View>
                                    {confirmPassword && password !== confirmPassword && (
                                        <View className="flex-row items-center mt-2 ml-1">
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text className="text-red-500 text-[12px] ml-1 font-bold">Mật khẩu xác nhận không khớp</Text>
                                        </View>
                                    )}
                                </Animated.View>

                                {/* Hộp Yêu cầu bảo mật */}
                                <Animated.View entering={FadeInDown.delay(500).springify()} className="bg-white/80 p-5 rounded-[24px] border border-white shadow-sm shadow-slate-100 mt-2">
                                    <Text className="text-[12px] tracking-wider text-slate-400 font-bold mb-4 uppercase">Yêu cầu bảo mật</Text>

                                    {/* Điều kiện 1 */}
                                    <View className="flex-row items-center mb-3">
                                        <Ionicons
                                            name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                                            size={20}
                                            color={hasMinLength ? "#10b981" : "#cbd5e1"}
                                        />
                                        <Text className={`ml-3 text-[14px] ${hasMinLength ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                                            Ít nhất 8 ký tự
                                        </Text>
                                    </View>

                                    {/* Điều kiện 2 */}
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={hasLettersAndNumbers ? "checkmark-circle" : "ellipse-outline"}
                                            size={20}
                                            color={hasLettersAndNumbers ? "#10b981" : "#cbd5e1"}
                                        />
                                        <Text className={`ml-3 text-[14px] ${hasLettersAndNumbers ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                                            Bao gồm chữ và số
                                        </Text>
                                    </View>
                                </Animated.View>

                                {/* Nút Đổi mật khẩu */}
                                <Animated.View entering={FadeInDown.delay(600).springify()}>
                                    <Pressable
                                        className={`w-full mt-6 h-14 rounded-full justify-center items-center shadow-lg active:scale-[0.98] transition-all ${loading ? 'bg-slate-300 shadow-transparent' : 'bg-emerald-500 shadow-emerald-500/30'
                                            }`}
                                        onPress={handleReset}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text className="text-white text-[17px] font-bold tracking-wide">Đổi mật khẩu</Text>
                                        )}
                                    </Pressable>
                                </Animated.View>

                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}