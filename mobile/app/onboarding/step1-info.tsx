import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, StatusBar, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

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
    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        
        {/* Header - Emerald Style */}
        <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full active:bg-white/30">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    
                    {/* Pagination Dots (Step 1/5) */}
                    <View className="flex-row gap-2">
                        <View className="w-8 h-2 bg-white rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                    </View>

                    <Pressable onPress={() => router.replace('/(tabs)')}>
                        <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                    </Pressable>
                </View>

                {/* Header Content */}
                <View className="items-center mt-2">
                    <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                        <Ionicons name="person-outline" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-2">Thông tin cơ bản</Text>
                    <Text className="text-white/90 text-center text-base px-4">
                        Giới thiệu một chút về bản thân bạn nhé
                    </Text>
                </View>
            </SafeAreaView>
            
            {/* Decorative circles */}
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10" />
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1"
        >
            <View className="flex-1 px-6 pt-8 pb-8 justify-between">
                <View className="gap-6">
                    
                    {/* 1. Tên hiển thị */}
                    <View>
                        <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Tên hiển thị</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-16 bg-gray-50 focus:border-emerald-500 transition-colors">
                            <Ionicons name="text-outline" size={22} color="#9ca3af" />
                            <TextInput 
                                className="flex-1 ml-3 text-lg font-medium text-gray-900 h-full"
                                placeholder="Nhập tên của bạn"
                                placeholderTextColor="#9ca3af"
                                value={fullName}
                                onChangeText={(t) => {
                                    setFullName(t);
                                    updateData({ full_name: t });
                                }}
                            />
                        </View>
                    </View>

                    {/* 2. Giới tính */}
                    <View>
                        <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Giới tính</Text>
                        <View className="flex-row gap-4">
                            <Pressable 
                                onPress={() => setGender('male')}
                                className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border transition-all ${
                                    gender === 'male' ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <Ionicons name="male" size={24} color={gender === 'male' ? '#10b981' : '#9ca3af'} />
                                <Text className={`ml-2 text-lg font-semibold ${gender === 'male' ? 'text-emerald-600' : 'text-gray-500'}`}>Nam</Text>
                            </Pressable>

                            <Pressable 
                                onPress={() => setGender('female')}
                                className={`flex-1 flex-row items-center justify-center p-4 rounded-2xl border transition-all ${
                                    gender === 'female' ? 'bg-pink-50 border-pink-500' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <Ionicons name="female" size={24} color={gender === 'female' ? '#ec4899' : '#9ca3af'} />
                                <Text className={`ml-2 text-lg font-semibold ${gender === 'female' ? 'text-pink-600' : 'text-gray-500'}`}>Nữ</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* 3. Ngày sinh */}
                    <View>
                        <Text className="text-gray-700 text-base font-semibold mb-2 ml-1">Ngày sinh</Text>
                        <Pressable 
                            onPress={() => setShowDatePicker(true)}
                            className="flex-row items-center border border-gray-200 rounded-2xl px-4 h-16 bg-gray-50 active:bg-gray-100"
                        >
                            <Ionicons name="calendar-outline" size={22} color="#10b981" />
                            <Text className="ml-3 text-lg font-medium text-gray-900">
                                {formatDate(dob)}
                            </Text>
                            <View className="flex-1 items-end">
                                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Footer Button */}
                <Pressable 
                    className={`w-full p-5 rounded-full flex-row items-center justify-center shadow-lg transition-all active:scale-[0.98] ${
                        !fullName.trim() ? 'bg-gray-300 opacity-70' : 'bg-orange-500 shadow-orange-500/30'
                    }`}
                    onPress={handleNext}
                    disabled={!fullName.trim()}
                >
                    <Text className="text-white text-xl font-bold mr-2">Tiếp tục</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </Pressable>
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