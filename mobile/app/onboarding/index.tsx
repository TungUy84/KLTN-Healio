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

      <SafeAreaView className="flex-1 justify-between px-8 py-5 pb-16">
        {/* Phần nội dung chính (Hero Section) */}
        <View className="flex-1 justify-center items-center -mt-10">
          {/* Logo Card nảy */}
          <Animated.View entering={FadeIn.delay(300).duration(800)} className="mb-8 relative items-center">
            <Animated.View entering={FadeInDown.delay(200).springify().damping(12)} className="shadow-2xl shadow-emerald-400/40 rounded-[40px] p-4 border border-emerald-100/10 relative z-10">
              <Image
                source={require('../../assets/images/iconhealio.png')}
                className="w-72 h-72 rounded-[28px]"
                resizeMode="cover"
              />
            </Animated.View>

            {/* Tên App ngay dưới Logo */}
            <Animated.Text entering={FadeInUp.delay(500).springify()} className="text-[28px] font-black tracking-[0.2em] uppercase" style={{ color: '#40928a' }}>
              Healio
            </Animated.Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} className="items-center w-full">
            <Text className="text-[36px] font-black text-slate-800 text-center mb-3 tracking-tighter" style={{ lineHeight: 48 }}>
              Nâng tầm Sức khỏe
            </Text>
            <Text className="text-[16px] text-slate-500 text-center leading-relaxed px-2 font-medium">
              Cá nhân hóa dinh dưỡng và tự động gợi ý thực đơn thông minh chỉ với vài thao tác.
            </Text>
          </Animated.View>
        </View>

        {/* Nút Bắt đầu */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full">
          {/* Nút to, bo tròn đặc biệt kiểu Pill */}
          <Pressable
            onPress={() => router.push('/onboarding/step1-info')}
            className="bg-slate-900 h-[72px] rounded-[36px] flex-row items-center justify-center px-2 shadow-xl shadow-slate-900/20 active:opacity-90 active:scale-[0.98] transition-all relative"
          >
            <Text className="text-white text-[18px] font-bold tracking-wide">Bắt đầu hành trình</Text>

            <View className="absolute right-2 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-md shadow-emerald-600/50">
              <Ionicons name="arrow-forward" size={24} color="white" />
            </View>
          </Pressable>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}