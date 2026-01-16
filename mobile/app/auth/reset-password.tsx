import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ChevronLeftIcon, CheckCircleIcon } from "react-native-heroicons/solid";

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
            
            Alert.alert(
                'Thành công', 
                'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
                [{ text: 'OK', onPress: () => router.navigate('/auth/sign-in') }]
            );
            
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Đặt lại mật khẩu thất bại';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
             <View className="flex-row items-center px-4 pt-2 mb-8">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-4 bg-white rounded-full shadow-sm">
                    <ChevronLeftIcon size={20} color="#111" />
                </TouchableOpacity>
                <View className="flex-1">
                     <View className="items-end">
                        <View className="w-full h-1 bg-gray-200 rounded-full mb-1">
                            <View className="h-1 bg-emerald-500 rounded-full w-full" />
                        </View>
                        <Text className="text-[10px] text-emerald-600 font-bold uppercase">Bước 3: Đổi mật khẩu</Text>
                     </View>
                </View>
            </View>
    
            <View className="px-6"> 
                <Text className="text-2xl font-bold text-gray-900 mb-2 mt-4">Tạo mật khẩu mới</Text>
                <Text className="text-base text-gray-500 mb-8 leading-6">
                    Vui lòng nhập mật khẩu mới khác với mật khẩu cũ để đảm bảo an toàn.
                </Text>

                <View className="w-full">
                    
                    {/* New Password */}
                    <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</Text>
                    <View className="flex-row items-center w-full bg-white border border-gray-200 rounded-xl px-4 h-14 mb-4 focus:border-emerald-500">
                        <LockClosedIcon size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                        <TextInput 
                            className="flex-1 text-base text-gray-900 h-full"
                            placeholder="••••••••" 
                            placeholderTextColor="#9CA3AF"
                            value={password} 
                            onChangeText={setPassword} 
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                            {showPassword ? 
                                <EyeSlashIcon size={20} color="#6B7280" /> : 
                                <EyeIcon size={20} color="#6B7280" />
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text className="text-sm font-medium text-gray-700 mb-2">Nhập lại mật khẩu</Text>
                    <View className="flex-row items-center w-full bg-white border border-gray-200 rounded-xl px-4 h-14 mb-6 focus:border-emerald-500">
                        <LockClosedIcon size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                        <TextInput 
                            className="flex-1 text-base text-gray-900 h-full"
                            placeholder="••••••••" 
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword} 
                            onChangeText={setConfirmPassword} 
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                            {showConfirmPassword ? 
                                <EyeSlashIcon size={20} color="#6B7280" /> : 
                                <EyeIcon size={20} color="#6B7280" />
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Requirements Box */}
                    <View className="bg-white p-5 rounded-xl border border-gray-200 mb-8">
                        <Text className="text-xs text-gray-500 font-bold mb-4 uppercase">Yêu cầu bảo mật</Text>
                        
                        <View className="flex-row items-center mb-3">
                            {hasMinLength ? 
                                <CheckCircleIcon size={20} color="#10b981" /> : 
                                <View className="w-5 h-5 rounded-full border border-gray-300" />
                            }
                            <Text className={`ml-3 text-sm ${hasMinLength ? 'text-gray-900' : 'text-gray-500'}`}>
                                Ít nhất 8 ký tự
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            {hasLettersAndNumbers ? 
                                <CheckCircleIcon size={20} color="#10b981" /> : 
                                <View className="w-5 h-5 rounded-full border border-gray-300" />
                            }
                            <Text className={`ml-3 text-sm ${hasLettersAndNumbers ? 'text-gray-900' : 'text-gray-500'}`}>
                                Bao gồm chữ và số
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                             <View className="w-5 h-5 rounded-full border border-gray-300" />
                            <Text className="ml-3 text-sm text-gray-500">Khác với mật khẩu gần nhất</Text>
                        </View>
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity 
                        className="w-full bg-emerald-500 h-14 rounded-xl justify-center items-center shadow-lg shadow-emerald-200 mb-6"
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Đổi mật khẩu</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}