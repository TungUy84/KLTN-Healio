import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Dimensions, StatusBar, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Step1Info() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [fullName, setFullName] = useState(data.full_name || '');
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
    updateData({ full_name: fullName });
    router.push('/onboarding/step2-body');
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        
        {/* Header - Emerald Background */}
        <View className="bg-emerald-500 pb-8 rounded-b-[40px] shadow-sm relative z-10 overflow-hidden">
            <SafeAreaView edges={['top']} className="px-6 pb-4">
                {/* Navbar */}
                <View className="flex-row justify-between items-center mb-6 mt-2">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/20 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    
                    {/* Progress Bar */}
                    <View className="flex-row gap-2">
                        <View className="w-8 h-2 bg-white rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                        <View className="w-2 h-2 bg-white/30 rounded-full" />
                    </View>

                    <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                        <Text className="text-white font-semibold text-base">Bỏ qua</Text>
                    </TouchableOpacity>
                </View>

                {/* Header Content */}
                <View className="items-center mt-4">
                    <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center mb-4 border border-white/30 backdrop-blur-md">
                        <Ionicons name="person-outline" size={40} color="white" />
                    </View>
                    <Text className="text-3xl font-bold text-white text-center mb-2">Thông tin cơ bản</Text>
                    <Text className="text-white/90 text-center text-base">
                        Hãy bắt đầu với tên và ngày sinh của bạn
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
            <View className="flex-1 px-6 pt-10 pb-8 justify-between">
                <View className="gap-8">
                    {/* Input Group: Name */}
                    <View>
                        <Text className="text-gray-800 text-lg font-semibold mb-3 ml-2">Bạn tên là gì?</Text>
                        <TextInput 
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-xl font-bold text-gray-800 shadow-sm text-center"
                            placeholder="Nhập tên của bạn"
                            placeholderTextColor="#9ca3af"
                            value={fullName}
                            onChangeText={(t) => {
                                setFullName(t);
                                updateData({ full_name: t });
                            }}
                        />
                    </View>

                    {/* Input Group: DOB */}
                    <View>
                        <Text className="text-gray-800 text-lg font-semibold mb-3 ml-2">Ngày sinh của bạn?</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 flex-row items-center justify-center gap-3 shadow-sm"
                        >
                            <Ionicons name="calendar-outline" size={24} color="#10b981" />
                            <Text className="text-xl font-bold text-gray-800">
                                {formatDate(dob)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Button - Accent Orange */}
                <TouchableOpacity 
                    className={`bg-orange-500 w-full p-5 rounded-full flex-row items-center justify-center shadow-lg shadow-orange-500/30 ${!fullName.trim() ? 'opacity-50' : ''}`}
                    onPress={handleNext}
                    disabled={!fullName.trim()}
                >
                    <Text className="text-white text-xl font-bold mr-2">Tiếp tục</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
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
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
                             <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-4">
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text className="text-gray-500 text-lg">Hủy</Text>
                                </TouchableOpacity>
                                <Text className="text-lg font-bold text-gray-800">Chọn ngày sinh</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text className="text-emerald-600 text-lg font-bold">Xong</Text>
                                </TouchableOpacity>
                             </View>
                             <DateTimePicker
                                testID="dateTimePicker"
                                value={dob}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                themeVariant="light"
                                textColor="black"
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
            />
        )}

      </View>
    </TouchableWithoutFeedback>
  );
}
