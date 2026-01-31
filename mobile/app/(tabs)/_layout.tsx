import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolateColor, interpolate, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// CẤU HÌNH MENU - Sử dụng Feather Icons
const TABS = [
  { name: 'index', title: 'Nhật ký', icon: 'book-open' },
  { name: 'foods', title: 'Thực đơn', icon: 'coffee' },
  { name: 'progress', title: 'Thống kê', icon: 'bar-chart-2' },
  { name: 'profile', title: 'Tài khoản', icon: 'user' },
];

const TabButton = ({ item, isFocused, onPress }: { item: any, isFocused: boolean, onPress: () => void }) => {
  const focusedSV = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    focusedSV.value = withSpring(isFocused ? 1 : 0, { damping: 12, stiffness: 100 });
  }, [isFocused]);

  // Animation Style
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(focusedSV.value, [0, 1], [0, -6]) }, // Nhảy nhẹ lên
      ],
      backgroundColor: interpolateColor(focusedSV.value, [0, 1], ['transparent', '#0D9488']), // Primary Color
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(focusedSV.value, [0, 1], ['#94a3b8', '#ffffff']), // Slate-400 -> White
      transform: [{ scale: interpolate(focusedSV.value, [0, 1], [1, 0.9]) }]
    }
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center h-full z-10"
      activeOpacity={0.8}
    >
      <Animated.View
        className="w-12 h-12 items-center justify-center rounded-full"
        style={[animatedContainerStyle]}
      >
        <Animated.Text style={animatedIconStyle}>
          <Feather
            name={item.icon as any}
            size={24}
          />
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: { state: any, descriptors: any, navigation: any }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute bottom-0 w-full items-center pointer-events-box-none">
      <View
        className="bg-white flex-row h-[70px] w-[90%] items-center justify-around rounded-[35px] shadow-lg shadow-slate-200/50 border border-slate-100 mb-5 pl-2 pr-2"
        style={{
          elevation: 10, // Android shadow
          marginBottom: Platform.OS === 'ios' ? insets.bottom : 20
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
            <TabButton
              key={route.key}
              item={item}
              isFocused={isFocused}
              onPress={onPress}
            />
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
      <Tabs.Screen name="index" options={{ title: 'Nhật ký' }} />
      <Tabs.Screen name="foods" options={{ title: 'Thực đơn' }} />
      <Tabs.Screen name="progress" options={{ title: 'Thống kê' }} />
      <Tabs.Screen name="profile" options={{ title: 'Tài khoản' }} />
    </Tabs>
  );
}
