import React, { useState } from 'react';
import { 
  View, Text, TextInput, Pressable, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';

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
            // await authService.resetPassword(email as string, otp as string, password);
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
        <StatusBar barStyle="dark-content" />
        <SafeAreaView className="flex-1">
            
            {/* Header: Back Button */}
            <View className="px-6 py-2">
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
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
                    <View className="flex-1 px-6 items-center pt-4">
                        
                         {/* Icon Chìa khóa */}
                        <View className="w-24 h-24 bg-emerald-50 rounded-full items-center justify-center mb-6 border border-emerald-100">
                             <Ionicons name="key-outline" size={48} color="#10b981" />
                        </View>
            
                        <Text className="text-3xl font-bold text-gray-900 mb-2 mt-2 text-center">Tạo mật khẩu mới</Text>
                        <Text className="text-base text-gray-500 mb-8 leading-6 text-center px-4">
                            Vui lòng nhập mật khẩu mới khác với mật khẩu cũ để đảm bảo an toàn.
                        </Text>

                        <View className="w-full gap-5">
                            
                            {/* Mật khẩu mới */}
                            <View>
                                <Text className="text-gray-700 font-medium mb-2 ml-1">Mật khẩu mới</Text>
                                <View className="flex-row items-center w-full bg-white border border-gray-200 rounded-2xl px-4 h-14 focus:border-emerald-500 transition-colors">
                                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                                    <TextInput 
                                        className="flex-1 ml-3 text-base text-gray-900 h-full"
                                        placeholder="••••••••" 
                                        placeholderTextColor="#9CA3AF"
                                        value={password} 
                                        onChangeText={setPassword} 
                                        secureTextEntry={!showPassword}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Nhập lại mật khẩu */}
                            <View>
                                <Text className="text-gray-700 font-medium mb-2 ml-1">Nhập lại mật khẩu</Text>
                                <View className={`flex-row items-center w-full bg-white border rounded-2xl px-4 h-14 transition-colors ${confirmPassword && password !== confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-emerald-500'}`}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={confirmPassword && password !== confirmPassword ? "#ef4444" : "#9CA3AF"} />
                                    <TextInput 
                                        className="flex-1 ml-3 text-base text-gray-900 h-full"
                                        placeholder="••••••••" 
                                        placeholderTextColor="#9CA3AF"
                                        value={confirmPassword} 
                                        onChangeText={setConfirmPassword} 
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                                    </Pressable>
                                </View>
                                 {confirmPassword && password !== confirmPassword && (
                                    <View className="flex-row items-center mt-2 ml-1">
                                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                        <Text className="text-red-500 text-xs ml-1 font-medium">Mật khẩu xác nhận không khớp</Text>
                                    </View>
                                )}
                            </View>

                            {/* Hộp Yêu cầu bảo mật */}
                            <View className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-2">
                                <Text className="text-xs text-gray-500 font-bold mb-4 uppercase">Yêu cầu bảo mật</Text>
                                
                                {/* Điều kiện 1 */}
                                <View className="flex-row items-center mb-3">
                                    <Ionicons 
                                        name={hasMinLength ? "checkmark-circle" : "ellipse-outline"} 
                                        size={20} 
                                        color={hasMinLength ? "#10b981" : "#d1d5db"} 
                                    />
                                    <Text className={`ml-3 text-sm ${hasMinLength ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        Ít nhất 8 ký tự
                                    </Text>
                                </View>

                                {/* Điều kiện 2 */}
                                <View className="flex-row items-center">
                                    <Ionicons 
                                        name={hasLettersAndNumbers ? "checkmark-circle" : "ellipse-outline"} 
                                        size={20} 
                                        color={hasLettersAndNumbers ? "#10b981" : "#d1d5db"} 
                                    />
                                    <Text className={`ml-3 text-sm ${hasLettersAndNumbers ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        Bao gồm chữ và số
                                    </Text>
                                </View>
                            </View>

                            {/* Nút Đổi mật khẩu */}
                            <Pressable 
                                className={`w-full mt-4 h-14 rounded-full justify-center items-center shadow-lg active:scale-[0.98] transition-all ${
                                    loading ? 'bg-gray-400' : 'bg-emerald-500 shadow-emerald-500/30'
                                }`}
                                onPress={handleReset}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white text-lg font-bold">Đổi mật khẩu</Text>
                                )}
                            </Pressable>

                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
}