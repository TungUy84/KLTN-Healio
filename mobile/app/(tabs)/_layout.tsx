import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, interpolateColor, interpolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// CẤU HÌNH MENU
const TABS = [
  { name: 'index', title: 'Nhật ký', icon: 'book' },
  { name: 'foods', title: 'Thực đơn', icon: 'restaurant' },
  { name: 'progress', title: 'Thống kê', icon: 'stats-chart' },
  { name: 'profile', title: 'Tài khoản', icon: 'person' },
];

const TabButton = ({ item, isFocused, onPress }: { item: any, isFocused: boolean, onPress: () => void }) => {
  const focusedSV = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    focusedSV.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  // Animation Style
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(focusedSV.value, [0, 1], [0, -10]) },
      ],
      backgroundColor: interpolateColor(focusedSV.value, [0, 1], ['rgba(255, 255, 255, 0)', '#10b981']),
      // Shadow động
      shadowOpacity: interpolate(focusedSV.value, [0, 1], [0, 0.3]),
      elevation: interpolate(focusedSV.value, [0, 1], [0, 8]),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(focusedSV.value, [0, 1], [0.7, 1]),
      color: interpolateColor(focusedSV.value, [0, 1], ['#9ca3af', '#10b981'])
    }
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center h-full z-10"
      activeOpacity={0.8}
    >
      <View className="items-center h-[60px] justify-center">
        {/* Circle Icon Container */}
        <Animated.View
          style={[
            { width: 50, height: 50, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 } },
            animatedContainerStyle
          ]}
        >
          <Ionicons
            name={isFocused ? item.icon : `${item.icon}-outline`}
            size={isFocused ? 28 : 24}
            color={isFocused ? 'white' : '#9ca3af'}
          />
        </Animated.View>

        {/* Text Label */}
        <Animated.Text
          style={[{ marginTop: 4, fontSize: 10, fontWeight: isFocused ? '600' : '400' }, animatedTextStyle]}
        >
          {item.title}
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: { state: any, descriptors: any, navigation: any }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white absolute bottom-0 w-full shadow-lg rounded-t-[24px]"
      style={{
        paddingBottom: insets.bottom,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 20
      }}
    >
      <View className="flex-row h-[70px] items-center justify-around">
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
