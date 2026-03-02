import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StatusBar, Alert, Image, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('tunguychim@gmail.com');
    const [password, setPassword] = useState('Tunguytv@2004');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Google Auth Request
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        redirectUri: Platform.select({
            web: undefined,
            default: 'https://auth.expo.io/@tunguykim/mobile'
        })
    });

    // Handle Google Login Response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            fetchUserInfo(authentication?.accessToken);
        }
    }, [response]);

    const fetchUserInfo = async (token: string | undefined) => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await res.json();

            // Call Backend API
            const data = await authService.loginGoogle(user);

            // Navigate
            if (data.user?.is_onboarded) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        } catch (error: any) {
            console.log("Google Login Error", error);
            Alert.alert('Lỗi', 'Đăng nhập Google thất bại');
        } finally {
            setLoading(false);
        }
    };

    // PB_01 - AC3 & AC4: Xử lý đăng nhập
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
            return;
        }

        setLoading(true);
        try {
            // Gọi API Login thật
            const data = await authService.login(email, password);

            // Check nếu chưa Onboard -> Chuyển sang Onboarding Step 1
            if (data.user?.is_onboarded) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        } catch (error: any) {
            console.log("Login fail:", error);

            // Check tài khoản chưa kích hoạt (status 403 & pending)
            if (error.response?.status === 403 && error.response?.data?.mustVerify) {
                Alert.alert(
                    'Chưa kích hoạt',
                    'Tài khoản này chưa xác thực OTP. Bạn có muốn nhập mã ngay?',
                    [
                        { text: 'Hủy', style: 'cancel' },
                        {
                            text: 'Nhập OTP',
                            onPress: () => {
                                // Gửi lại OTP mới luôn cho tiện người dùng (Optional)
                                authService.resendOtp(email, 'register').catch(() => { });
                                router.push({ pathname: '/auth/otp', params: { email, type: 'register' } });
                            }
                        }
                    ]
                );
                return;
            }

            const msg = error.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng';
            Alert.alert('Đăng nhập thất bại', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <AmbientGlowBackground />
            <SafeAreaView className="flex-1">
                {/* Dùng ScrollView để đảm bảo không bị che khi bật bàn phím trên màn nhỏ */}
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 }}>

                    {/* Header Logo/Title */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-10 pt-4">
                        <View className="shadow-2xl shadow-emerald-200 bg-white rounded-[32px] mb-6 p-2 border border-emerald-50">
                            <Image
                                source={require('../../assets/images/iconhealio.png')}
                                className="w-24 h-24 rounded-[24px]"
                                resizeMode="cover"
                            />
                        </View>
                        <Text className="text-[28px] font-black text-slate-800 tracking-tight">Chào mừng trở lại</Text>
                        <Text className="text-slate-500 mt-2 font-medium">Đăng nhập để tiếp tục lộ trình sức khỏe</Text>
                    </Animated.View>

                    {/* Form Input */}
                    <View className="gap-5">
                        {/* Email */}
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Email</Text>
                            <View className="flex-row items-center border border-slate-200 rounded-[20px] px-4 h-14 bg-white/60 focus:border-emerald-500 focus:bg-white shadow-sm shadow-slate-100">
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-800 text-[16px] font-medium"
                                    placeholder="Điền email của bạn"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </Animated.View>

                        {/* Password */}
                        <Animated.View entering={FadeInDown.delay(300).springify()}>
                            <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm tracking-tight">Mật khẩu</Text>
                            <View className="flex-row items-center border border-slate-200 rounded-[20px] px-4 h-14 bg-white/60 focus:border-emerald-500 focus:bg-white shadow-sm shadow-slate-100">
                                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 ml-3 text-slate-800 text-[16px] font-medium"
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                                </Pressable>
                            </View>
                            <Pressable className="self-end mt-3" onPress={() => router.push('/auth/forgot-password')}>
                                <Text className="text-emerald-600 font-bold text-sm">Quên mật khẩu?</Text>
                            </Pressable>
                        </Animated.View>
                    </View>

                    {/* Action Buttons */}
                    <View className="mt-8 gap-5">
                        {/* Login Button */}
                        <Animated.View entering={FadeInDown.delay(400).springify()}>
                            <Pressable
                                onPress={handleLogin}
                                disabled={loading}
                                className={`h-14 rounded-full items-center justify-center shadow-lg active:opacity-80 active:scale-[0.98] transition-all
                                    ${loading ? 'bg-emerald-300 shadow-emerald-200' : 'bg-emerald-500 shadow-emerald-500/30'}`}
                            >
                                <Text className="text-white text-[17px] font-bold tracking-wide">
                                    {loading ? 'Đang vào...' : 'Đăng nhập'}
                                </Text>
                            </Pressable>
                        </Animated.View>

                        {/* Google Login */}
                        <Animated.View entering={FadeInDown.delay(500).springify()}>
                            <View className="flex-row items-center my-1.5">
                                <View className="flex-1 h-[1px] bg-slate-200" />
                                <Text className="mx-4 text-slate-400 text-[13px] font-bold">Hoặc đăng nhập với</Text>
                                <View className="flex-1 h-[1px] bg-slate-200" />
                            </View>

                            <Pressable
                                disabled={!request}
                                onPress={() => promptAsync()}
                                className="h-14 mt-1 rounded-full border border-slate-200 flex-row items-center justify-center bg-white/80 active:bg-slate-50 shadow-sm shadow-slate-100"
                            >
                                <Image
                                    source={require('../../assets/images/google-logo.png')}
                                    className="w-5 h-5"
                                    resizeMode="contain"
                                />
                                <Text className="ml-3 text-slate-700 font-bold text-[16px]">Google</Text>
                            </Pressable>
                        </Animated.View>
                    </View>

                    {/* Footer Link */}
                    <Animated.View entering={FadeInDown.delay(600).springify()} className="flex-row justify-center mt-10 mb-6">
                        <Text className="text-slate-500 font-medium">Chưa có tài khoản? </Text>
                        <Pressable onPress={() => router.push('/auth/sign-up')} className="px-1 active:opacity-60">
                            <Text className="text-emerald-600 font-bold">Đăng ký ngay</Text>
                        </Pressable>
                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}