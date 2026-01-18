import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeftIcon, HeartIcon } from "react-native-heroicons/solid";
import { PlusIcon } from "react-native-heroicons/outline";
import { foodService, Food } from '../../services/foodService';
import { Colors } from '../../constants/Colors';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await foodService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const handleSelectFood = (food: Food) => {
    router.push({
      pathname: '/food/food-detail',
      params: { id: food.id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 rounded-full bg-gray-50">
            <ChevronLeftIcon size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">Món yêu thích</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/foods')} className="p-2 bg-gray-50 rounded-full">
            <PlusIcon size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center mt-20">
                <HeartIcon size={64} color="#EEE" />
                <Text className="text-gray-400 text-lg mt-4 text-center">Chưa có món yêu thích nào</Text>
                <TouchableOpacity 
                    className="mt-6 bg-[#10b981] px-6 py-3 rounded-full"
                    onPress={() => router.push('/(tabs)/foods')}
                >
                    <Text className="text-white font-bold">Thêm món ngay</Text>
                </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="flex-row bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100 items-center"
              onPress={() => handleSelectFood(item)}
            >
              <View className="w-16 h-16 bg-gray-50 rounded-xl mr-4 overflow-hidden items-center justify-center">
                   {item.image ? (
                      <Image 
                          source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${item.image}` }} 
                          className="w-full h-full"
                          resizeMode="cover"
                      />
                  ) : (
                      <Text className="text-2xl">🍲</Text>
                  )}
              </View>
              
              <View className="flex-1">
                  <Text className="font-bold text-gray-800 text-base mb-1" numberOfLines={1}>{item.name}</Text>
                  <Text className="text-xs text-gray-500">
                      {Math.round(item.calories)} kcal • {item.serving_unit || 'suất'}
                  </Text>
              </View>
              
              <HeartIcon size={24} color="red" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
