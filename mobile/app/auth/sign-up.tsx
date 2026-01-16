import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StatusBar, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

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
                }} 
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
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        
        {/* Header với nút Back */}
        <View className="px-6 py-2 z-10">
            <Pressable 
                onPress={() => router.back()} 
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200"
            >
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
            >
            
            {/* Header Content */}
            <View className="items-center mb-8 mt-2">
                <Image 
                    source={require('../../assets/images/logohealio.png')} 
                    className="w-60 h-40 mb-4 rounded-3xl" 
                    resizeMode="contain"
                />
                <Text className="text-3xl font-bold text-gray-900 text-center">Tạo tài khoản</Text>
                <Text className="text-gray-500 mt-2 text-center">Bắt đầu hành trình sống khỏe cùng Healio</Text>
            </View>

            <View className="gap-5">
                {/* Email Field */}
                <View>
                <Text className="text-gray-700 font-medium mb-2 ml-1">Email</Text>
                <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-14 bg-gray-50 focus:border-emerald-500 transition-colors">
                    <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                    <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="email@domain.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9ca3af"
                    />
                </View>
                </View>

                {/* Password Field */}
                <View>
                <Text className="text-gray-700 font-medium mb-2 ml-1">Mật khẩu</Text>
                <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-14 bg-gray-50 focus:border-emerald-500 transition-colors">
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                    <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="Trên 10 ký tự"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9ca3af"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                    </Pressable>
                </View>
                
                {/* Thanh độ mạnh mật khẩu (Đã sửa thành Progress Bar) */}
                {renderStrengthBar()}
                
                {/* Gợi ý mật khẩu */}
                {password.length === 0 && (
                    <Text className="text-xs text-gray-400 mt-2 ml-1 italic">
                    * Mật khẩu nên có chữ hoa, số và ký tự đặc biệt
                    </Text>
                )}
                </View>

                {/* Confirm Password Field */}
                <View>
                <Text className="text-gray-700 font-medium mb-2 ml-1">Xác nhận mật khẩu</Text>
                <View className={`flex-row items-center border rounded-2xl px-4 h-14 bg-gray-50 transition-colors ${confirmPassword && password !== confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-emerald-500'}`}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={confirmPassword && password !== confirmPassword ? "#ef4444" : "#9ca3af"} />
                    <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9ca3af"
                    />
                </View>
                {confirmPassword && password !== confirmPassword && (
                    <View className="flex-row items-center mt-2 ml-1">
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text className="text-red-500 text-xs ml-1 font-medium">Mật khẩu không trùng khớp</Text>
                    </View>
                )}
                </View>
            </View>

            {/* Sign Up Button */}
            <Pressable 
                onPress={loading ? undefined : handleSignUp}
                disabled={loading}
                className={`mt-10 h-14 rounded-full items-center justify-center shadow-lg shadow-emerald-500/20 transition-all ${loading ? 'bg-emerald-300' : 'bg-emerald-500 active:opacity-90 active:scale-[0.99]'}`}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-bold">Đăng ký tài khoản</Text>
                )}
            </Pressable>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8 mb-4">
                <Text className="text-gray-500">Đã có tài khoản? </Text>
                <Pressable onPress={() => router.back()} className="active:opacity-70">
                <Text className="text-emerald-600 font-bold">Đăng nhập ngay</Text>
                </Pressable>
            </View>

            </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}