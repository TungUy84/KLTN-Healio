import { View, Text, Image, Pressable, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import AnimatedBackground from '../../components/onboarding/AnimatedBackground';

const { width } = Dimensions.get('window');
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AnimatedBackground />

      <SafeAreaView className="flex-1 justify-between px-8 py-12 pb-16">

        {/* Header Title */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-4">
          <View className="flex-row items-center bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 mb-6 shadow-sm shadow-emerald-100">
            <Ionicons name="sparkles" size={16} color="#10B981" />
            <Text className="text-emerald-600 font-bold ml-2 tracking-widest text-[12px] uppercase">Hành trình sức khỏe</Text>
          </View>
        </Animated.View>

        {/* Phần nội dung chính (Hero Section) */}
        <View className="flex-1 justify-center items-center -mt-10">
          {/* Logo Card nảy */}
          <Animated.View entering={FadeIn.delay(300).duration(800)} className="mb-10 relative">
            <Animated.View entering={FadeInDown.delay(200).springify().damping(12)} className="shadow-2xl shadow-emerald-400/40 bg-white rounded-[40px] p-4 border border-emerald-100/50 relative z-10">
              <Image
                source={require('../../assets/images/iconhealio.png')}
                className="w-40 h-40 rounded-[28px]"
                resizeMode="cover"
              />
            </Animated.View>

            {/* Decors */}
            <Animated.View entering={FadeInUp.delay(500).springify()} className="absolute -top-6 -right-6 w-14 h-14 bg-orange-100 rounded-full items-center justify-center border-4 border-white shadow-sm shadow-orange-200">
              <Text className="text-2xl">🔥</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(600).springify()} className="absolute -bottom-4 -left-6 w-12 h-12 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm shadow-blue-200">
              <Text className="text-xl">💧</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} className="items-center w-full">
            <Text className="text-[40px] font-black text-slate-800 text-center mb-3 tracking-tighter" style={{ lineHeight: 48 }}>
              Thiết kế lại{'\n'}Cơ thể bạn
            </Text>
            <Text className="text-[16px] text-slate-500 text-center leading-relaxed px-2 font-medium">
              Chỉ 2 phút để khởi tạo một kế hoạch dinh dưỡng & tập luyện cá nhân hóa hoàn toàn.
            </Text>
          </Animated.View>
        </View>

        {/* Nút Bắt đầu */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full">
          {/* Nút to, bo tròn đặc biệt kiểu Pill */}
          <Pressable
            onPress={() => router.push('/onboarding/step1-info')}
            className="bg-slate-900 h-[72px] rounded-[36px] flex-row items-center justify-between px-2 shadow-xl shadow-slate-900/20 active:opacity-90 active:scale-[0.98] transition-all"
          >
            <View className="pl-6">
              <Text className="text-white text-[18px] font-bold tracking-wide">Bắt đầu hành trình</Text>
            </View>
            <View className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-md shadow-emerald-600/50">
              <Ionicons name="arrow-forward" size={24} color="white" />
            </View>
          </Pressable>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}