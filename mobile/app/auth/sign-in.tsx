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

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            <StatusBar barStyle="dark-content" />
            <SafeAreaView className="flex-1">
                {/* Dùng ScrollView để đảm bảo không bị che khi bật bàn phím trên màn nhỏ */}
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>

                    {/* Header Logo/Title */}
                    <View className="items-center mb-6">
                        <Image
                            source={require('../../assets/images/logohealio.png')}
                            className="w-60 h-40 mb-4 rounded-3xl"
                            resizeMode="contain"
                        />
                        <Text className="text-3xl font-bold text-gray-900">Chào mừng trở lại</Text>
                        <Text className="text-gray-500 mt-2">Đăng nhập để tiếp tục lộ trình sức khỏe</Text>
                    </View>

                    {/* Form Input */}
                    <View className="gap-4">
                        {/* Email */}
                        <View>
                            <Text className="text-gray-700 font-medium mb-1.5 ml-1">Email</Text>
                            <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-14 bg-gray-50 focus:border-emerald-500">
                                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="nhapemail@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View>
                            <Text className="text-gray-700 font-medium mb-1.5 ml-1">Mật khẩu</Text>
                            <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-14 bg-gray-50 focus:border-emerald-500">
                                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-900 text-base"
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                                </Pressable>
                            </View>
                            <Pressable className="self-end mt-2" onPress={() => router.push('/auth/forgot-password')}>
                                <Text className="text-emerald-600 font-medium text-sm">Quên mật khẩu?</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="mt-8 gap-4">
                        {/* Login Button */}
                        <Pressable
                            onPress={handleLogin}
                            disabled={loading}
                            className={`h-14 rounded-full items-center justify-center shadow-lg shadow-emerald-500/20 active:opacity-90 ${loading ? 'bg-gray-400' : 'bg-emerald-500'}`}
                        >
                            <Text className="text-white text-lg font-bold">
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Text>
                        </Pressable>

                        {/* Divider */}
                        <View className="flex-row items-center my-2">
                            <View className="flex-1 h-[1px] bg-gray-200" />
                            <Text className="mx-4 text-gray-400 text-sm">Hoặc đăng nhập với</Text>
                            <View className="flex-1 h-[1px] bg-gray-200" />
                        </View>

                        {/* Google Login */}
                        <Pressable
                            disabled={!request}
                            onPress={() => promptAsync()}
                            className="h-14 rounded-full border border-gray-200 flex-row items-center justify-center bg-white active:bg-gray-50"
                        >
                            <Image
                                source={require('../../assets/images/google-logo.png')}
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                            <Text className="ml-3 text-gray-700 font-semibold text-base">Google</Text>
                        </Pressable>
                    </View>

                    {/* Footer Link */}
                    <View className="flex-row justify-center mt-8 mb-4">
                        <Text className="text-gray-500">Chưa có tài khoản? </Text>
                        <Pressable onPress={() => router.push('/auth/sign-up')}>
                            <Text className="text-emerald-600 font-bold">Đăng ký ngay</Text>
                        </Pressable>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}