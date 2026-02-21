import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolateColor, interpolate, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// CẤU HÌNH MENU - Sử dụng Feather Icons
const TABS = [
  { name: 'index', title: 'Nhật ký', icon: 'book-open' },
  { name: 'foods', title: 'Thực đơn', icon: 'coffee' },
  { name: 'progress', title: 'Thống kê', icon: 'bar-chart-2' },
  { name: 'profile', title: 'Tài khoản', icon: 'user' },
];

const CustomTabBar = ({ state, descriptors, navigation }: { state: any, descriptors: any, navigation: any }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute bottom-6 w-full items-center pointer-events-box-none">
      <View
        className="bg-[#1A1A1A] flex-row h-[70px] w-[90%] items-center justify-around rounded-[35px] shadow-2xl pl-2 pr-2 overflow-visible"
        style={{
          elevation: 10,
          marginBottom: Platform.OS === 'ios' ? insets.bottom / 2 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        }}
      >
        {/* Lọc ra 4 tabs chính để render ở 2 bên */}
        {state.routes.map((route: any, index: number) => {
          const item = TABS.find(t => t.name === route.name);
          if (!item) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Render button bình thường
          const Button = (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="w-12 h-12 items-center justify-center rounded-full active:bg-white/10"
            >
              <Feather
                name={item.icon as any}
                size={22}
                color={isFocused ? '#ffffff' : '#6b7280'}
              />
            </TouchableOpacity>
          );

          // Chèn nút trung tâm ở giữa (sau tab thứ 2)
          if (index === 1) {
            return (
              <React.Fragment key={route.key}>
                {Button}
                {/* Center Glowing Action Button - AI Suggestion */}
                <View className="relative -top-5" key="center-action">
                  <View className="absolute inset-0 bg-emerald-400 blur-xl opacity-40 rounded-full scale-150" />
                  <TouchableOpacity
                    className="w-[60px] h-[60px] bg-slate-800 rounded-full items-center justify-center border-4 border-[#1A1A1A] shadow-xl z-20 active:scale-95"
                    style={{
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 12,
                      elevation: 15,
                    }}
                    onPress={() => DeviceEventEmitter.emit('triggerAISuggestion')}
                  >
                    <View className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-300 items-center justify-center">
                      <Ionicons name="sparkles" size={26} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            );
          }

          return Button;
        })}
      </View>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Nhật ký' }} />
      <Tabs.Screen name="foods" options={{ title: 'Thực đơn' }} />
      <Tabs.Screen name="progress" options={{ title: 'Thống kê' }} />
      <Tabs.Screen name="profile" options={{ title: 'Tài khoản' }} />
    </Tabs>
  );
}
