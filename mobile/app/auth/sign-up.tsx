import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon, ArrowLeftIcon } from "react-native-heroicons/outline";

export default function SignUpScreen() {
    const router = useRouter();
    const [name, setName] = useState(''); // Note: Design doesn't show Name, but API needs it. Keeping invisible or adding a "Full Name" step? The image just says "Email", "Password". I'll assume standard registration needs name or we infer it. I'll keep Email/Password as main UI to match image, maybe add Name if user needs it. But image shows "Email" and "Password".
    // Wait, standard signup usually asks for Name. I'll keep it but if user says "match image", maybe I should check image again. Image 2: "Đăng ký tài khoản", Email, Mật khẩu. No Name field.
    // I will hide Name field to match image and pass a default or ask later?
    // Actually, I'll keep Name field but minimal, or better yet, just Email and Password and Auto-generate name/ask later.
    // But backend needs name? `authService.register(email, password, full_name)`. I'll pass email as name for now or add the field if I can make it look good.
    // Let's add the field but keep it clean.
    
    // Correcting: The user said "làm giao diện như hình". The image has:
    // Header: "Đăng ký tài khoản", "Bắt đầu...", 
    // Email input (envelope icon placeholder?) -> No, just text.
    // Password input (lock icon?)
    // Password strength bar (orange/yellow lines).
    // Orange Button "Đăng ký".
    // Google/Apple buttons.
    
    // I will stick to this. I will remove "Name" from UI to match image fidelity, and pass `email` as `full_name` to backend for now.
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
  
    // Calculate Password Strength
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 4) score++;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strengthScore = getStrength(password);
    
    // Helper to get Color based on score
    const getBarColor = (index: number) => {
        if (index >= strengthScore) return '#E0E0E0'; // Empty
        if (strengthScore <= 2) return Colors.orange; // Weak/Medium
        return '#00D084'; // Strong (Green)
    };

    const getStrengthText = () => {
        switch(strengthScore) {
            case 0: return 'Chưa nhập';
            case 1: return 'Yếu';
            case 2: return 'Trung bình';
            case 3: return 'Khá';
            case 4: return 'Mạnh';
            default: return '';
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
            return;
        }
        try {
            setLoading(true);
            await authService.register(email, password, email.split('@')[0]); // Use part of email as name
            Alert.alert('Thành công', 'OTP đã được gửi.');
            router.push({ pathname: '/auth/otp', params: { email, type: 'register' } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Đăng ký thất bại';
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
                <TouchableOpacity onPress={() => router.back()} style={{alignSelf: 'flex-start', marginBottom: 20}}>
                     <ArrowLeftIcon size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Đăng ký tài khoản</Text>
                <Text style={styles.subtitle}>Bắt đầu hành trình dinh dưỡng của bạn cùng Healio</Text>
            </View>
    
            <View style={styles.form}>
                
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                    <EnvelopeIcon size={20} color="#9E9E9E" style={{marginRight: 10}} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="nhập địa chỉ email"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={email} 
                        onChangeText={setEmail} 
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.inputContainer}>
                     <LockClosedIcon size={20} color="#9E9E9E" style={{marginRight: 10}} />
                    <TextInput 
                        style={styles.input} 
                        placeholder="••••••••" 
                        placeholderTextColor={Colors.textPlaceholder}
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        {showPassword ? 
                            <EyeIcon size={20} color="#9E9E9E" /> : 
                            <EyeSlashIcon size={20} color="#9E9E9E" />
                        }
                    </TouchableOpacity>
                </View>

                {/* Password Strength Bar (Dynamic) */}
                <View style={styles.strengthContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View key={i} style={[styles.strengthBar, { backgroundColor: getBarColor(i) }]} />
                    ))}
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
                    <Text style={{color: strengthScore > 2 ? '#00D084' : Colors.orange, fontSize: 12}}>
                        ● Độ mạnh: {getStrengthText()}
                    </Text>
                    <Text style={{color: '#9E9E9E', fontSize: 12}}>Ít nhất 8 ký tự</Text>
                </View>

                 {/* Confirm Pass (Image shows "Xác nhận mật khẩu" in bottom half? No, Image 2 only shows 1 Password field. But Reset Pass has 2. I'll stick to Image 2 which has 2 inputs: Email, Password. And a Strength bar. Then "Xác nhận mật khẩu" below? Ah, the cropped image 3 shows "Xác nhận mật khẩu" at the bottom. Okay, I will add it.) 
                 Wait, Image 2 (Register) has Email, Password, Strength Bar, then "Xác nhận mật khẩu".
                 */}
                 <Text style={styles.label}>Xác nhận mật khẩu</Text>
                 <View style={styles.inputContainer}>
                     <View style={{width: 20, marginRight: 10}} /> 
                     {/* Icon placeholder to align text if needed, or just padding. Image shows 'lock' or 'refresh'? Text says "nhập lại mật khẩu". */}
                     <TextInput 
                        style={styles.input} 
                        placeholder="nhập lại mật khẩu"
                        placeholderTextColor={Colors.textPlaceholder}
                        secureTextEntry
                    />
                    <EyeSlashIcon size={20} color="#9E9E9E" />
                 </View>

                {/* Register Button - ORANGE */}
                <TouchableOpacity 
                    style={styles.registerButton} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Đăng ký</Text>}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>hoặc đăng ký với</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#EA4335'}}>G</Text>
                        <Text style={styles.socialBtnText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#000'}}></Text>
                        <Text style={styles.socialBtnText}>Apple</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                     <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
                        <Text style={styles.signInLink}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
    header: { marginTop: 20, marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', lineHeight: 24 },
    form: { width: '100%' },
    label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8, marginTop: 10 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
        borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 15, height: 52,
    },
    input: { flex: 1, fontSize: 16, color: '#000', height: '100%' },
    eyeIcon: { padding: 5 },
    strengthContainer: { flexDirection: 'row', marginTop: 10, marginBottom: 5, gap: 5 },
    strengthBar: { height: 4, flex: 1, borderRadius: 2 },
    registerButton: {
        backgroundColor: Colors.orange, height: 52, borderRadius: 12, marginTop: 20,
        justifyContent: 'center', alignItems: 'center', shadowColor: Colors.orange,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
    dividerText: { marginHorizontal: 10, color: '#999', fontSize: 12 },
    socialRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    socialButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 50, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, gap: 10
    },
    socialBtnText: { fontWeight: '500', color: '#000' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: '#666', fontSize: 14 },
    signInLink: { color: Colors.orange, fontWeight: 'bold', fontSize: 14 },
});