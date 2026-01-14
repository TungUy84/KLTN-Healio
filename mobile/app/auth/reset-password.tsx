import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';
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
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
             <View style={styles.topNav}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeftIcon size={24} color="#111" />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                     <View style={styles.headerRow}>
                        <View style={styles.progressBarBackground}>
                            <View style={[styles.progressBarFill, { width: '100%' }]} />
                        </View>
                        <Text style={styles.stepText}>STEP 3: RESET</Text>
                     </View>
                </View>
            </View>
    
            <View style={styles.content}>
                
                <Text style={styles.title}>Tạo mật khẩu mới</Text>
                <Text style={styles.subtitle}>
                    Vui lòng nhập mật khẩu mới khác với mật khẩu cũ để đảm bảo an toàn.
                </Text>

                <View style={styles.form}>
                    
                    {/* New Password */}
                    <Text style={styles.label}>Mật khẩu mới</Text>
                    <View style={styles.inputContainer}>
                        <LockClosedIcon size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="••••••••" 
                            placeholderTextColor={Colors.textPlaceholder}
                            value={password} 
                            onChangeText={setPassword} 
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconRight}>
                            {showPassword ? 
                                <EyeSlashIcon size={20} color={Colors.textSecondary} /> : 
                                <EyeIcon size={20} color={Colors.textSecondary} />
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Nhập lại mật khẩu</Text>
                    <View style={styles.inputContainer}>
                        <LockClosedIcon size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="••••••••" 
                            placeholderTextColor={Colors.textPlaceholder}
                            value={confirmPassword} 
                            onChangeText={setConfirmPassword} 
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.iconRight}>
                            {showConfirmPassword ? 
                                <EyeSlashIcon size={20} color={Colors.textSecondary} /> : 
                                <EyeIcon size={20} color={Colors.textSecondary} />
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Requirements Box */}
                    <View style={styles.requirementsContainer}>
                        <Text style={styles.reqTitle}>YÊU CẦU BẢO MẬT</Text>
                        
                        <View style={styles.reqItem}>
                            {hasMinLength ? 
                                <CheckCircleIcon size={20} color={Colors.success} /> : 
                                <View style={styles.uncheckedCircle} />
                            }
                            <Text style={styles.reqText}>Ít nhất 8 ký tự</Text>
                        </View>

                        <View style={styles.reqItem}>
                            {hasLettersAndNumbers ? 
                                <CheckCircleIcon size={20} color={Colors.success} /> : 
                                <View style={styles.uncheckedCircle} />
                            }
                            <Text style={styles.reqText}>Bao gồm chữ và số</Text>
                        </View>

                        <View style={styles.reqItem}>
                             <View style={styles.uncheckedCircle} />
                            <Text style={styles.reqText}>Khác với mật khẩu gần nhất</Text>
                        </View>
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    topNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
    backButton: { padding: 5, marginRight: 10 },
    progressContainer: { flex: 1 },
    headerRow: { flexDirection: 'column', alignItems: 'flex-end' },
    progressBarBackground: { width: '100%', height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 5 },
    progressBarFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 2 },
    stepText: { fontSize: 10, color: Colors.orange, fontWeight: 'bold' },
    
    content: { paddingHorizontal: 24 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 10, marginTop: 10 },
    subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 30 },
    
    form: { width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 15, height: 52, marginBottom: 20 },
    input: { flex: 1, fontSize: 16, color: '#212121', height: '100%' },
    iconRight: { padding: 5 },
    
    requirementsContainer: { marginTop: 10, marginBottom: 30, backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
    reqTitle: { fontSize: 12, color: Colors.textSecondary, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
    reqItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    uncheckedCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#BDBDBD' },
    reqText: { marginLeft: 10, color: '#424242', fontSize: 14 },
    
    button: {
        backgroundColor: Colors.orange, height: 52, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
