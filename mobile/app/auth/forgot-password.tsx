import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';
import { ChevronLeftIcon, ArrowLongRightIcon, CheckCircleIcon } from "react-native-heroicons/solid";
import { EnvelopeIcon } from "react-native-heroicons/outline";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSend = async () => {
        if (!email) {
            Alert.alert('Thông báo', 'Vui lòng nhập email');
            return;
        }

        try {
            setLoading(true);
            await authService.forgotPassword(email);
            router.push({ pathname: '/auth/otp', params: { email, type: 'forgot-password' } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gửi yêu cầu thất bại';
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeftIcon size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.progressWrapper}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '33%' }]} />
                    </View>
                    <Text style={styles.stepText}>STEP 1: INPUT</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.orangeLight }]}>
                     {/* Circular arrow icon */}
                     <Text style={{fontSize: 32, fontWeight:'bold', color: Colors.orange}}>↺</Text> 
                </View>

                <Text style={styles.title}>Quên mật khẩu?</Text>
                <Text style={styles.subtitle}>
                    Đừng lo, chuyện này vẫn thường xảy ra. Hãy nhập email của bạn để nhận mã xác thực.
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <EnvelopeIcon size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="user@example.com"
                            placeholderTextColor={Colors.textPlaceholder}
                            value={email} 
                            onChangeText={setEmail} 
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        {email.length > 5 && email.includes('@') && (
                            <CheckCircleIcon size={20} color={Colors.success} />
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleSend}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={styles.buttonText}>Gửi mã OTP </Text>
                                <ArrowLongRightIcon size={20} color="#fff" style={{marginLeft: 5}}/>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
                        <Text style={styles.backLoginText}>Quay lại đăng nhập</Text>
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
    backButton: { padding: 5, marginRight: 15 },
    progressWrapper: { flex: 1, alignItems: 'flex-end' },
    progressBarBg: { width: '100%', height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 5 },
    progressBarFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 2 },
    stepText: { fontSize: 10, color: Colors.orange, fontWeight: 'bold' },
    
    content: { paddingHorizontal: 24, alignItems: 'center' },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
        marginBottom: 20, marginTop: 10,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#000', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    
    form: { width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 15, height: 52, marginBottom: 25,
    },
    input: { flex: 1, fontSize: 16, color: '#000', height: '100%' },
    
    button: {
        backgroundColor: Colors.orange, height: 52, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', shadowColor: Colors.orange,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backLoginText: { textAlign: 'center', color: '#666', fontSize: 14 },
});
