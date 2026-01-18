import React from 'react';
import { View, Text, Image, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Họa tiết trang trí nền (Background Circles) */}
      <View className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-100 rounded-full opacity-50 blur-2xl" />
      <View className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-orange-100 rounded-full opacity-50 blur-2xl" />

      <SafeAreaView className="flex-1 justify-between px-6 py-10">
        
        {/* Phần nội dung chính */}
        <View className="flex-1 justify-center items-center">
          {/* Logo to và nổi bật */}
          <View className="shadow-xl shadow-emerald-200 bg-white rounded-[40px] mb-8 p-2">
             <Image 
                source={require('../../assets/images/logohealio.png')} 
                className="w-64 h-64 rounded-[32px]" 
                resizeMode="contain"
            />
          </View>

          {/* <Text className="text-4xl font-extrabold text-emerald-600 text-center mb-3 tracking-wider">
            Healio
          </Text> */}
          
          <Text className="text-xl font-semibold text-gray-800 text-center mb-4">
            Dinh dưỡng thông minh
          </Text>

          <Text className="text-base text-gray-500 text-center leading-6 px-4">
            Thiết lập hồ sơ sức khỏe cá nhân để chúng tôi xây dựng lộ trình dinh dưỡng phù hợp nhất dành riêng cho bạn.
          </Text>
        </View>

        {/* Nút Bắt đầu */}
        <View className="w-full">
            <Pressable 
                onPress={() => router.push('/onboarding/step1-info')}
                className="bg-emerald-500 h-16 rounded-full flex-row items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all"
            >
                <Text className="text-white text-xl font-bold mr-2">Bắt đầu ngay</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
            </Pressable>
            
            {/* Dòng chữ nhỏ bên dưới */}
            <Text className="text-xs text-gray-400 text-center mt-4">
                Chỉ mất khoảng 2 phút để hoàn thành
            </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}