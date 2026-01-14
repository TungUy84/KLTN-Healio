import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';
import { EyeIcon, EyeSlashIcon } from "react-native-heroicons/outline";

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
            return;
        }
        try {
            setLoading(true);
            await authService.login(email, password);
             // Success
            router.replace('/(tabs)'); 
        } catch (err: any) {
             if (err.response?.status === 403 && err.response?.data?.mustVerify) {
                 Alert.alert('Chưa kích hoạt', 'Tài khoản chưa xác thực. OTP đã được gửi.');
                 router.push({ pathname: '/auth/otp', params: { email, type: 'register' } });
                 return;
             }
             const msg = err.response?.data?.message || 'Đăng nhập thất bại';
             Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.appName}>Healio</Text>
                <Text style={styles.tagline}>Chăm sóc sức khỏe mỗi ngày</Text>
                
                <Text style={styles.welcomeText}>Chào mừng bạn quay lại!</Text>
            </View>
    
            <View style={styles.form}>
                
                <Text style={styles.label}>Email</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="nhap_email_cua_ban@example.com"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.passwordContainer}>
                    <TextInput 
                        style={styles.passwordInput} 
                        placeholder="••••••••" 
                        placeholderTextColor={Colors.textPlaceholder}
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        {showPassword ? 
                            <EyeIcon size={20} color={Colors.primary} /> : 
                            <EyeSlashIcon size={20} color={Colors.primary} />
                        }
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.forgotPassContainer}
                    onPress={() => router.push('/auth/forgot-password')}
                >
                    <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Đăng nhập</Text>}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>HOẶC</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert("Coming soon")}>
                    <Text style={{color: '#EA4335', fontSize: 18, fontWeight: 'bold', marginRight: 10}}>G</Text>
                    <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                        <Text style={styles.signUpLink}>Đăng ký ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 24 },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
    logoContainer: {
        width: 80, height: 80, backgroundColor: '#E0F2F1',
        borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    },
    logo: { width: 40, height: 40, tintColor: Colors.primary },
    appName: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 5 },
    tagline: { fontSize: 14, color: '#666', marginBottom: 30 },
    welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    form: { width: '100%' },
    label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8, marginTop: 10 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12,
        paddingHorizontal: 15, height: 52, fontSize: 16, color: '#000',
    },
    passwordContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 15, height: 52,
    },
    passwordInput: { flex: 1, fontSize: 16, color: '#000', height: '100%' },
    eyeIcon: { padding: 5 },
    forgotPassContainer: { alignItems: 'flex-end', marginTop: 10, marginBottom: 20 },
    forgotPassText: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
    loginButton: {
        backgroundColor: Colors.primary, height: 52, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
    dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12 },
    googleButton: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', height: 52,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
    },
    googleButtonText: { color: '#000', fontSize: 16, fontWeight: '500' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#666', fontSize: 14 },
    signUpLink: { color: Colors.success, fontWeight: 'bold', fontSize: 14 },
});
