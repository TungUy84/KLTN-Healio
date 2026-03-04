import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StatusBar, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
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

// Bật Animation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SignUpScreen() {
    const router = useRouter();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation State
    const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
    const [passwordScore, setPasswordScore] = useState(0); // 0-3

    // PB_03 - AC3: Kiểm tra độ mạnh mật khẩu
    useEffect(() => {
        let score = 0;
        if (password.length > 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9!@#$%^&*]/.test(password)) score++;

        // Kích hoạt Animation mượt mà khi điểm số thay đổi
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setPasswordScore(score);
        if (score === 3) setPasswordStrength('Strong');
        else if (score === 2) setPasswordStrength('Medium');
        else setPasswordStrength('Weak');

    }, [password]);

    // PB_03 - AC4 & AC5: Xử lý đăng ký
    const handleSignUp = async () => {
        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không đúng định dạng');
            return;
        }

        // Validate Password
        if (password.length <= 10) {
            Alert.alert('Lỗi', 'Mật khẩu phải có trên 10 ký tự');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setLoading(true);
            // Auto-generate full name from email prefix (to satisfy backend requirement without UI field)
            const autoFullName = email.split('@')[0];

            // Gọi API đăng ký thực tế
            await authService.register(email, password, autoFullName);

            // AC5: Thành công -> Chuyển hướng sang màn hình nhập OTP
            router.push({ pathname: '/auth/otp', params: { email, type: 'register' } });
        } catch (error: any) {
            console.log('Sign up error:', error);
            Alert.alert('Lỗi đăng ký', error.response?.data?.message || 'Không thể đăng ký. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Helper render thanh độ mạnh mật khẩu (Dạng Progress Bar liền mạch)
    const renderStrengthBar = () => {
        if (password.length === 0) return null;

        // Cấu hình hiển thị theo điểm số
        const config = {
            0: { width: '10%', color: '#ef4444', label: 'Quá yếu' }, // Đỏ
            1: { width: '35%', color: '#ef4444', label: 'Yếu' },     // Đỏ
            2: { width: '65%', color: '#f59e0b', label: 'Trung bình' }, // Cam
            3: { width: '100%', color: '#10b981', label: 'Mạnh' }    // Xanh
        };

        // Lấy cấu hình tương ứng với điểm hiện tại
        const current = config[passwordScore as 0 | 1 | 2 | 3] || config[0];

        return (
            <View className="mt-3">
                {/* Thanh nền xám */}
                <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    {/* Thanh màu chạy bên trong */}
                    <View
                        className="h-full rounded-full"
                        style={{
                            width: current.width,
                            backgroundColor: current.color
                        } as any}
                    />
                </View>

                {/* Chữ hiển thị trạng thái */}
                <View className="flex-row justify-end items-center mt-2">
                    <Text className="text-xs text-gray-400 mr-1">Độ an toàn:</Text>
                    <Text className="text-xs font-bold" style={{ color: current.color }}>
                        {current.label}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />
            <SafeAreaView className="flex-1">

                {/* Header với nút Back */}
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
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 }}
                    >

                        {/* Header Content */}
                        <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-10 mt-2">
                            <View className="shadow-2xl shadow-emerald-200 bg-white rounded-[32px] mb-6 p-2 border border-emerald-50">
                                <Image
                                    source={require('../../assets/images/iconhealio.png')}
                                    className="w-20 h-20 rounded-[24px]"
                                    resizeMode="cover"
                                />
                            </View>
                            <Text className="text-[28px] font-black text-slate-800 text-center tracking-tight">Tạo tài khoản</Text>
                            <Text className="text-slate-500 mt-2 text-center font-medium">Bắt đầu hành trình sống khỏe cùng Healio</Text>
                        </Animated.View>

                        <View className="gap-6">
                            {/* Email Field */}
                            <Animated.View entering={FadeInDown.delay(200).springify()}>
                                <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Email</Text>
                                <View className="flex-row items-center border border-slate-200 rounded-[20px] px-4 h-14 bg-white/60 focus:border-emerald-500 focus:bg-white shadow-sm shadow-slate-100 transition-colors">
                                    <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-800 text-[16px] font-medium"
                                        placeholder="email@domain.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </Animated.View>

                            {/* Password Field */}
                            <Animated.View entering={FadeInDown.delay(300).springify()}>
                                <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Mật khẩu</Text>
                                <View className="flex-row items-center border border-slate-200 rounded-[20px] px-4 h-14 bg-white/60 focus:border-emerald-500 focus:bg-white shadow-sm shadow-slate-100 transition-colors">
                                    <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-800 text-[16px] font-medium"
                                        placeholder="Trên 10 ký tự"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor="#94a3b8"
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                                    </Pressable>
                                </View>

                                {/* Thanh độ mạnh mật khẩu (Đã sửa thành Progress Bar) */}
                                {renderStrengthBar()}

                                {/* Gợi ý mật khẩu */}
                                {password.length === 0 && (
                                    <Text className="text-[11px] text-slate-400 mt-2 ml-1 font-medium">
                                        * Mật khẩu nên có chữ hoa, số và ký tự đặc biệt
                                    </Text>
                                )}
                            </Animated.View>

                            {/* Confirm Password Field */}
                            <Animated.View entering={FadeInDown.delay(400).springify()}>
                                <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Xác nhận mật khẩu</Text>
                                <View className={`flex-row items-center border rounded-[20px] px-4 h-14 bg-white/60 transition-colors shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-red-400 shadow-red-100' : 'border-slate-200 focus:border-emerald-500 focus:bg-white shadow-slate-100'}`}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={confirmPassword && password !== confirmPassword ? "#ef4444" : "#94a3b8"} />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-800 text-[16px] font-medium"
                                        placeholder="Nhập lại mật khẩu"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                                {confirmPassword && password !== confirmPassword && (
                                    <View className="flex-row items-center mt-2 ml-1">
                                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                        <Text className="text-red-500 text-[12px] ml-1 font-bold">Mật khẩu không trùng khớp</Text>
                                    </View>
                                )}
                            </Animated.View>
                        </View>

                        {/* Sign Up Button */}
                        <Animated.View entering={FadeInDown.delay(500).springify()}>
                            <Pressable
                                onPress={loading ? undefined : handleSignUp}
                                disabled={loading}
                                className={`mt-10 h-14 rounded-full items-center justify-center shadow-lg transition-all ${loading ? 'bg-emerald-300 shadow-emerald-200' : 'bg-emerald-500 shadow-emerald-500/30 active:opacity-80 active:scale-[0.98]'}`}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-[17px] font-bold tracking-wide">Đăng ký tài khoản</Text>
                                )}
                            </Pressable>
                        </Animated.View>

                        {/* Login Link */}
                        <Animated.View entering={FadeInDown.delay(600).springify()} className="flex-row justify-center mt-8 mb-4">
                            <Text className="text-slate-500 font-medium">Đã có tài khoản? </Text>
                            <Pressable onPress={() => router.back()} className="px-1 active:opacity-60">
                                <Text className="text-emerald-600 font-bold">Đăng nhập ngay</Text>
                            </Pressable>
                        </Animated.View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}