import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, StatusBar, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';

export default function Step1Info() {
    const router = useRouter();
    const { data, updateData } = useOnboarding();
    const [showDatePicker, setShowDatePicker] = useState(false);

    // State cục bộ
    const [fullName, setFullName] = useState(data.full_name || '');
    const [gender, setGender] = useState<'male' | 'female'>(data.gender || 'male');
    const dob = data.dob ? new Date(data.dob) : new Date(2000, 0, 1);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            updateData({ dob: selectedDate });
        }
    };

    const handleNext = () => {
        if (!fullName.trim()) return;
        updateData({ full_name: fullName, gender });
        router.push('/onboarding/step2-body');
    };

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${d} / ${m} / ${date.getFullYear()}`;
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <AnimatedBackground color1="#10B981" color2="#34D399" color3="#059669" />

                <SafeAreaView edges={['top']} className="px-8 pb-4 pt-6">
                    {/* Navbar */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Pressable onPress={() => router.back()} className="w-11 h-11 bg-white/40 rounded-full items-center justify-center active:bg-white/60 backdrop-blur-md border border-white/50 shadow-sm shadow-emerald-100">
                            <Ionicons name="arrow-back" size={24} color="#064e3b" />
                        </Pressable>

                        {/* Pagination Dots (Step 1/5) */}
                        <View className="flex-row gap-2 bg-white/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/50">
                            <View className="w-8 h-2.5 bg-emerald-500 rounded-full shadow-sm" />
                            <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                            <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                            <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                            <View className="w-2.5 h-2.5 bg-emerald-200 rounded-full" />
                        </View>

                        <View className="w-11" />
                    </View>

                    {/* Header Content */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-4">
                        <Text className="text-[36px] font-black text-slate-800 text-center mb-3 tracking-tighter shadow-sm">Thông tin cơ bản</Text>
                        <Text className="text-slate-600 text-center text-[16px] font-medium px-4">
                            Giới thiệu một chút về bản thân bạn nhé.
                        </Text>
                    </Animated.View>
                </SafeAreaView>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 px-8 pt-6 pb-12 justify-between">
                        <View className="gap-8">

                            {/* 1. Tên hiển thị */}
                            <Animated.View entering={FadeInDown.delay(200).springify()}>
                                <Text className="text-slate-700 text-[15px] font-bold mb-3 ml-1 tracking-tight">Tên hiển thị</Text>
                                <View className="flex-row items-center border border-white/60 rounded-[24px] px-5 h-[68px] bg-white/70 shadow-lg shadow-slate-200/50 backdrop-blur-xl focus:border-emerald-500 transition-colors">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="text" size={20} color="#64748b" />
                                    </View>
                                    <TextInput
                                        className="flex-1 text-[18px] font-bold text-slate-800 h-full"
                                        placeholder="Nhập tên của bạn"
                                        placeholderTextColor="#94a3b8"
                                        value={fullName}
                                        onChangeText={(t) => {
                                            setFullName(t);
                                            updateData({ full_name: t });
                                        }}
                                    />
                                </View>
                            </Animated.View>

                            {/* 2. Giới tính - Dạng Card To */}
                            <Animated.View entering={FadeInDown.delay(300).springify()}>
                                <Text className="text-slate-700 text-[15px] font-bold mb-3 ml-1 tracking-tight">Giới tính</Text>
                                <View className="flex-row gap-4 h-32">
                                    <Pressable
                                        onPress={() => setGender('male')}
                                        className={`flex-1 rounded-[28px] border-2 justify-center items-center overflow-hidden transition-all active:scale-[0.96] ${gender === 'male' ? 'bg-white border-blue-400 shadow-xl shadow-blue-200' : 'bg-white/60 border-white/60 shadow-sm shadow-slate-200'
                                            }`}
                                    >
                                        <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${gender === 'male' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            <Ionicons name="male" size={28} color={gender === 'male' ? '#3b82f6' : '#94a3b8'} />
                                        </View>
                                        <Text className={`text-[16px] font-black ${gender === 'male' ? 'text-blue-600' : 'text-slate-400'}`}>Nam</Text>
                                        {gender === 'male' && <View className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full items-center justify-center"><Ionicons name="checkmark" size={12} color="white" /></View>}
                                    </Pressable>

                                    <Pressable
                                        onPress={() => setGender('female')}
                                        className={`flex-1 rounded-[28px] border-2 justify-center items-center overflow-hidden transition-all active:scale-[0.96] ${gender === 'female' ? 'bg-white border-pink-400 shadow-xl shadow-pink-200' : 'bg-white/60 border-white/60 shadow-sm shadow-slate-200'
                                            }`}
                                    >
                                        <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${gender === 'female' ? 'bg-pink-100' : 'bg-slate-100'}`}>
                                            <Ionicons name="female" size={28} color={gender === 'female' ? '#ec4899' : '#94a3b8'} />
                                        </View>
                                        <Text className={`text-[16px] font-black ${gender === 'female' ? 'text-pink-600' : 'text-slate-400'}`}>Nữ</Text>
                                        {gender === 'female' && <View className="absolute top-3 right-3 w-5 h-5 bg-pink-500 rounded-full items-center justify-center"><Ionicons name="checkmark" size={12} color="white" /></View>}
                                    </Pressable>
                                </View>
                            </Animated.View>

                            {/* 3. Ngày sinh */}
                            <Animated.View entering={FadeInDown.delay(400).springify()}>
                                <Text className="text-slate-700 text-[15px] font-bold mb-3 ml-1 tracking-tight">Ngày sinh</Text>
                                <Pressable
                                    onPress={() => setShowDatePicker(true)}
                                    className="flex-row items-center border border-white/60 rounded-[24px] px-5 h-[68px] bg-white/70 shadow-lg shadow-slate-200/50 backdrop-blur-xl active:bg-white/90 transition-colors"
                                >
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="calendar-outline" size={20} color="#10b981" />
                                    </View>
                                    <Text className="flex-1 text-[18px] font-bold text-slate-800 tracking-tight">
                                        {formatDate(dob)}
                                    </Text>
                                    <Ionicons name="chevron-down" size={24} color="#94a3b8" />
                                </Pressable>
                            </Animated.View>
                        </View>

                        {/* Footer Button - Style nút To */}
                        <Animated.View entering={FadeInDown.delay(500).springify()} className="w-full">
                            <Pressable
                                className={`h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-xl transition-all active:scale-[0.98] active:opacity-90 ${!fullName.trim() ? 'bg-slate-300 shadow-transparent' : 'bg-slate-900 shadow-slate-900/20'
                                    }`}
                                onPress={handleNext}
                                disabled={!fullName.trim()}
                            >
                                <View className="pl-6 flex-1 items-center">
                                    <Text className="text-white text-[18px] font-bold tracking-wide text-center">Tiếp tục</Text>
                                </View>
                                <View className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${!fullName.trim() ? 'bg-slate-400' : 'bg-emerald-500 shadow-emerald-500/50'}`}>
                                    <Ionicons name="arrow-forward" size={24} color="white" />
                                </View>
                            </Pressable>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>

                {/* Modal DatePicker for iOS */}
                {Platform.OS === 'ios' && (
                    <Modal
                        transparent={true}
                        animationType="fade"
                        visible={showDatePicker}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                            <View className="flex-1 justify-end bg-black/40">
                                <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
                                    <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-4">
                                        <Pressable onPress={() => setShowDatePicker(false)}>
                                            <Text className="text-gray-500 text-lg">Hủy</Text>
                                        </Pressable>
                                        <Text className="text-lg font-bold text-gray-800">Chọn ngày sinh</Text>
                                        <Pressable onPress={() => setShowDatePicker(false)}>
                                            <Text className="text-emerald-600 text-lg font-bold">Xong</Text>
                                        </Pressable>
                                    </View>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={dob}
                                        mode="date"
                                        display="spinner"
                                        onChange={handleDateChange}
                                        themeVariant="light"
                                        textColor="black"
                                        maximumDate={new Date()} // Không chọn ngày tương lai
                                        style={{ height: 200 }}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}

                {/* Android DatePicker */}
                {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dob}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}

            </View>
        </TouchableWithoutFeedback>
    );
}