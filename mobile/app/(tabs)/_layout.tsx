// mobile/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  PlusIcon, 
  ChartBarIcon, 
  UserIcon 
} from "react-native-heroicons/outline";
import { 
  HomeIcon as HomeSolid,
  CalendarDaysIcon as CalendarSolid,
  ChartBarIcon as ChartSolid,
  UserIcon as UserSolid
} from "react-native-heroicons/solid";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 10, // Shadow cho Android
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        }
      }}>

      {/* 1. TRANG CHỦ */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => 
            focused ? <HomeSolid size={26} color={color} /> : <HomeIcon size={26} color={color} />,
        }}
      />

      {/* 2. KẾ HOẠCH */}
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Kế hoạch',
          tabBarIcon: ({ color, focused }) => 
            focused ? <CalendarSolid size={26} color={color} /> : <CalendarDaysIcon size={26} color={color} />,
        }}
      />

      {/* 3. NÚT THÊM (+) - ĐẶC BIỆT */}
      <Tabs.Screen
        name="add-meal" 
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 56,
              height: 56,
              backgroundColor: Colors.primary,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30, // Đẩy nút lên cao
              elevation: 5,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}>
              <PlusIcon size={32} color="#FFFFFF" strokeWidth={3} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // Ngăn chặn mở tab bình thường
            // Mở Modal Tìm kiếm/Thêm món ăn
            navigation.navigate('search-food'); 
          },
        })}
      />

      {/* 4. TIẾN TRÌNH */}
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Tiến độ',
          tabBarIcon: ({ color, focused }) => 
            focused ? <ChartSolid size={26} color={color} /> : <ChartBarIcon size={26} color={color} />,
        }}
      />

      {/* 5. CÁ NHÂN */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => 
            focused ? <UserSolid size={26} color={color} /> : <UserIcon size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}