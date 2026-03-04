import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Platform, DeviceEventEmitter } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolateColor, interpolate, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// CẤU HÌNH MENU - Sử dụng Feather Icons
const TABS = [
  { name: 'index', title: 'Trang chủ', icon: 'home' },
  { name: 'foods', title: 'Thực đơn', icon: 'coffee' },
  { name: 'diary', title: 'Nhật ký', icon: 'book-open' },
  { name: 'progress', title: 'Thống kê', icon: 'bar-chart-2' },
  { name: 'profile', title: 'Tài khoản', icon: 'user' },
];

const CustomTabBar = ({ state, descriptors, navigation }: { state: any, descriptors: any, navigation: any }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute bottom-4 w-full items-center pointer-events-box-none">
      <View
        style={{
          flexDirection: 'row',
          height: 58,
          width: '88%',
          alignItems: 'center',
          justifyContent: 'space-around',
          borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.8)',
          paddingHorizontal: 8,
          elevation: 20,
          marginBottom: Platform.OS === 'ios' ? insets.bottom / 2 : 0,
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.6)',
        }}
      >
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

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 24,
                backgroundColor: isFocused ? '#10B981' : 'transparent',
                shadowColor: isFocused ? '#10B981' : 'transparent',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isFocused ? 0.4 : 0,
                shadowRadius: 12,
                elevation: isFocused ? 8 : 0,
              }}
            >
              <Feather
                name={item.icon as any}
                size={21}
                color={isFocused ? '#ffffff' : '#94A3B8'}
              />
            </TouchableOpacity>
          );
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
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="foods" options={{ title: 'Thực đơn' }} />
      <Tabs.Screen name="diary" options={{ title: 'Nhật ký' }} />
      <Tabs.Screen name="progress" options={{ title: 'Thống kê' }} />
      <Tabs.Screen name="profile" options={{ title: 'Tài khoản' }} />
    </Tabs>
  );
}
