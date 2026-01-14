import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Pressable 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';
import { ChevronLeftIcon } from "react-native-heroicons/solid";

export default function OtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { email, type } = params; 

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(105); // 01:45 = 105 seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Thông báo', 'Vui lòng nhập mã OTP hợp lệ (6 số)');
            return;
        }

        try {
            setLoading(true);
            
            if (type === 'register') {
                await authService.verifyRegisterOtp(email as string, otp);
                Alert.alert('Thành công', 'Tài khoản đã được kích hoạt.');
                router.replace('/(tabs)'); 
            } else if (type === 'forgot-password') {
                await authService.verifyResetOtp(email as string, otp);
                router.push({ pathname: '/auth/reset-password', params: { email, otp } });
            } else {
                 Alert.alert('Lỗi', 'Loại xác thực không hợp lệ');
            }
            
        } catch (err: any) {
             const msg = err.response?.data?.message || 'Xác thực thất bại';
             Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        try {
            setTimeLeft(120); 
            if (type === 'register') {
                 // await authService.resendRegisterOtp(email);
                 Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi (Giả lập).');
            } else if (type === 'forgot-password') {
                 await authService.forgotPassword(email as string);
                 Alert.alert('Đã gửi', 'Mã OTP mới đã được gửi.');
            }
        } catch (err: any) {
            Alert.alert('Lỗi', 'Không thể gửi lại mã OTP');
        }
    }

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
                            <View style={[styles.progressBarFill, { width: '66%' }]} />
                        </View>
                        <Text style={styles.stepText}>STEP 2: VERIFY</Text>
                     </View>
                </View>
            </View>
    
            <View style={styles.content}>
                
                <Text style={styles.title}>Nhập mã xác thực</Text>
                <Text style={styles.subtitle}>
                    Nhập mã 6 số chúng tôi vừa gửi tới{'\n'}
                    <Text style={{fontWeight: 'bold', color: '#111'}}>{email}</Text>
                </Text>

                <View style={styles.otpContainer}>
                    <TextInput 
                        style={styles.hiddenInput} 
                        value={otp}
                        onChangeText={(text) => setOtp(text.slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                        caretHidden
                    />
                    
                    <View style={styles.otpBoxesContainer}>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                             <Pressable 
                                key={index} 
                                style={[
                                    styles.otpBox, 
                                    otp.length === index && styles.otpBoxActive, 
                                    otp.length > index && styles.otpBoxFilled 
                                ]}
                                onPress={() => {/* focus logic handled by hidden input overlay */}}
                             >
                                <Text style={[
                                    styles.otpText,
                                    otp.length === index && { color: Colors.orange },
                                    otp.length > index && { color: '#000' }
                                ]}>
                                    {otp[index] || ''}
                                </Text>
                             </Pressable>
                        ))}
                    </View>
                </View>

                <Text style={styles.timerText}>
                    Mã có hiệu lực trong <Text style={{color: Colors.orange, fontWeight: 'bold'}}>{formatTime(timeLeft)}</Text>
                </Text>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Xác nhận</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendContainer} onPress={handleResend} disabled={timeLeft > 0}>
                    <Text style={[styles.resendText, timeLeft > 0 ? {color: '#BDBDBD'} : {color: '#666'}]}>
                        Bạn chưa nhận được mã? <Text style={[styles.resendLink, timeLeft > 0 ? {color: '#BDBDBD'} : {color: Colors.orange}]}>Gửi lại</Text>
                    </Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    topNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, marginBottom: 40 },
    backButton: { padding: 5, marginRight: 10 },
    progressContainer: { flex: 1 },
    headerRow: { flexDirection: 'column', alignItems: 'flex-end' },
    progressBarBackground: { width: '100%', height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 5 },
    progressBarFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 2 },
    stepText: { fontSize: 10, color: Colors.orange, fontWeight: 'bold' },
    
    content: { paddingHorizontal: 24, alignItems: 'center' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
    
    otpContainer: { width: '100%', alignItems: 'center', marginBottom: 30, height: 60, justifyContent: 'center' },
    hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0, zIndex: 2 },
    otpBoxesContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    otpBox: { width: 48, height: 58, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    otpBoxActive: { borderColor: Colors.orange, borderWidth: 2 },
    otpBoxFilled: { borderColor: Colors.orange, backgroundColor: '#FFF8E1' }, 
    otpText: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    
    timerText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 30 },
    button: {
        backgroundColor: Colors.orange, height: 52, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', width: '100%',
        shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    resendContainer: { marginTop: 20 },
    resendText: { fontSize: 14 },
    resendLink: { fontWeight: 'bold' },
});
