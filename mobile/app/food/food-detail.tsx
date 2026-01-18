import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Image, ActivityIndicator, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeftIcon, HeartIcon, CheckIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, FireIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartSolid } from "react-native-heroicons/solid";
import { foodService, Food } from '../../services/foodService';

const SERVING_SIZES = [
  { id: 'g', label: 'Gram (g)', ratio: 1 },
  { id: 'serving', label: '1 Suất', ratio: 0 }, 
];

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Bữa Sáng' },
    { id: 'lunch', label: 'Bữa Trưa' },
    { id: 'dinner', label: 'Bữa Tối' },
    { id: 'snack', label: 'Bữa Phụ' },
];

export default function FoodDetailScreen() {
  const params = useLocalSearchParams();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMicros, setShowMicros] = useState(false);
  
  // Selection State
  const [amount, setAmount] = useState('1'); 
  const [unit, setUnit] = useState(SERVING_SIZES[1]); 
  const [selectedMeal, setSelectedMeal] = useState<string>((params.mealType as string) || 'breakfast');

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  const loadData = async (id: string) => {
    try {
        setLoading(true);
        const data = await foodService.getById(id);
        setFood(data);
        if (data.is_favorite !== undefined) {
             setIsFavorite(data.is_favorite);
        }
    } catch (error) {
        Alert.alert('Error', 'Không thể tải thông tin món ăn');
        router.back();
    } finally {
        setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!food) return;
    try {
        await foodService.toggleFavorite(food.id);
        setIsFavorite(!isFavorite);
    } catch (error) {
        console.error(error);
    }
  };

  const handleAddToDiary = async () => {
    if (!food) return;

    try {
        await foodService.addToDiary({
            food_id: food.id,
            meal_type: selectedMeal,
            quantity: parseFloat(amount),
            unit_name: unit.label,
            date: new Date().toISOString().split('T')[0]
        });
        
        setShowAddModal(false);
        Alert.alert("Thành công", `Đã thêm ${food.name} vào nhật ký.`, [
            { text: "OK", onPress: () => router.navigate('/(tabs)') }
        ]);
    } catch (error) {
        Alert.alert('Lỗi', 'Không thể thêm vào nhật ký');
    }
  };

  if (loading || !food) {
      return (
          <View className="flex-1 justify-center items-center bg-white">
              <ActivityIndicator size="large" color="#10b981" />
          </View>
      );
  }

  // Calculate Display Nutrition
  const multiplier = parseFloat(amount || '0'); 
  
  const displayCal = Math.round(food.calories * multiplier);
  const displayP = Math.round(food.protein * multiplier);
  const displayC = Math.round(food.carb * multiplier);
  const displayF = Math.round(food.fat * multiplier);

  return (
    <View className="flex-1 bg-white">
      {/* Header Ảnh Món Ăn */}
      <View className="h-64 bg-green-50 relative">
        {food.image ? (
            <Image 
                source={{ uri: food.image.startsWith('http') ? food.image : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${food.image}` }} 
                className="w-full h-full"
                resizeMode="cover"
            />
        ) : (
            <View className="flex-1 justify-center items-center">
                <Text className="text-6xl">🍽️</Text>
            </View>
        )}
        <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-5 bg-black/30 p-2 rounded-full z-10">
          <ChevronLeftIcon size={24} color="#fff" />
        </TouchableOpacity>
        <View className="absolute inset-0 bg-black/10" />
      </View>

      <ScrollView className="flex-1 -mt-8 bg-white rounded-t-[30px] px-5 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row justify-between items-start mb-2">
          {/* Name Header */}
          <View className="flex-1 mr-4">
            <Text className="text-2xl font-bold text-gray-800">{food.name}</Text>
            <Text className="text-gray-500 mt-1">1 {food.serving_unit || 'suất'}</Text>
          </View>
          <TouchableOpacity onPress={handleToggleFavorite}>
            {isFavorite ? <HeartSolid size={28} color="red" /> : <HeartIcon size={28} color="#9CA3AF" />}
          </TouchableOpacity>
        </View>

        {/* Bộ chọn khẩu phần */}
        <View className="mb-6 flex-row items-center border-b border-gray-100 pb-4">
          <Text className="text-base text-gray-500 mr-4">Số lượng ăn:</Text>
          <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-lg">
            <TextInput 
                className="text-lg font-bold text-primary text-center min-w-[30px]"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            <Text className="text-base font-medium text-gray-600 ml-1">{food.serving_unit || 'Suất'}</Text>
          </View>
        </View>

        {/* Calories Focus */}
        <View className="flex-row items-center justify-between mb-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
            <View className="flex-row items-center">
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                    <FireIcon size={24} color="#F97316" />
                </View>
                <Text className="text-lg font-bold text-gray-700">Năng lượng</Text>
            </View>
            <View className="items-end">
                <Text className="text-3xl font-extrabold text-orange-500">{displayCal}</Text>
                <Text className="text-xs text-gray-500 font-bold">KCAL</Text>
            </View>
        </View>

        {/* Macros Row */}
        <View className="flex-row justify-between mb-2">
            <View className="w-[31%] bg-blue-50 p-3 rounded-2xl items-center border border-blue-100">
                <Text className="text-gray-500 text-xs mb-1 font-medium">Protein</Text>
                <Text className="text-xl font-bold text-blue-600">{displayP}g</Text>
                <View className="h-1 w-8 bg-blue-200 rounded-full mt-2"/>
            </View>
            <View className="w-[31%] bg-yellow-50 p-3 rounded-2xl items-center border border-yellow-100">
                <Text className="text-gray-500 text-xs mb-1 font-medium">Carbs</Text>
                <Text className="text-xl font-bold text-yellow-600">{displayC}g</Text>
                <View className="h-1 w-8 bg-yellow-200 rounded-full mt-2"/>
            </View>
            <View className="w-[31%] bg-red-50 p-3 rounded-2xl items-center border border-red-100">
                <Text className="text-gray-500 text-xs mb-1 font-medium">Fat</Text>
                <Text className="text-xl font-bold text-red-500">{displayF}g</Text>
                <View className="h-1 w-8 bg-red-200 rounded-full mt-2"/>
            </View>
        </View>
        
        {/* Micronutrients Toggle */}
        <TouchableOpacity 
            onPress={() => setShowMicros(!showMicros)}
            className="flex-row items-center justify-center py-2 mb-6"
        >
            <Text className="text-gray-500 font-medium mr-1">
                {showMicros ? 'Thu gọn dinh dưỡng' : 'Xem chi tiết dinh dưỡng'}
            </Text>
            {showMicros ? <ChevronUpIcon size={16} color="#6B7280" /> : <ChevronDownIcon size={16} color="#6B7280" />}
        </TouchableOpacity>

        {showMicros && (
            <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <Text className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Vi chất (Micronutrients)</Text>
                {food.micronutrients && Object.keys(food.micronutrients).length > 0 ? (
                    Object.entries(food.micronutrients).map(([key, value], idx) => (
                        <View key={key} className={`flex-row justify-between py-2 ${idx !== Object.keys(food.micronutrients || {}).length - 1 ? 'border-b border-gray-200' : ''}`}>
                            <Text className="text-gray-600 capitalize">
                                {key === 'fiber' ? 'Chất xơ' : 
                                key === 'sugar' ? 'Đường' : 
                                key === 'sodium' ? 'Natri' :
                                key === 'cholesterol' ? 'Cholesterol' : key}
                            </Text>
                            <Text className="font-medium text-gray-800">
                                {Math.round((value as number) * multiplier * 10) / 10}
                                {['sodium', 'cholesterol', 'potassium', 'calcium'].includes(key) ? 'mg' : 'g'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View>
                        <View className="flex-row justify-between py-2 border-b border-gray-200">
                            <Text className="text-gray-600">Chất xơ</Text>
                            <Text className="font-medium text-gray-800">--</Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                            <Text className="text-gray-600">Đường</Text>
                            <Text className="font-medium text-gray-800">--</Text>
                        </View>
                    </View>
                )}
            </View>
        )}

        {/* Tab Nguyên liệu - Vertical List Style */}
        {food.ingredients && food.ingredients.length > 0 && (
                <View className="mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">Nguyên liệu ({food.ingredients.length})</Text>
                <View className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                    {food.ingredients.map((ing, idx) => (
                        <View key={idx} className={`flex-row items-center p-3 ${idx < (food.ingredients?.length || 0) - 1 ? 'border-b border-gray-50' : ''}`}>
                            <View className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 mr-4">
                                    {ing.image ? (
                                    <Image 
                                        source={{ uri: ing.image.startsWith('http') ? ing.image : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${ing.image}` }} 
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-gray-200">
                                            <Text>🥗</Text>
                                    </View>
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-800">{ing.name}</Text>
                            </View>
                            <View className="bg-green-50 px-3 py-1 rounded-full">
                                <Text className="text-primary font-bold text-sm">
                                    {ing.FoodIngredient?.amount_in_grams ? `${Math.round(ing.FoodIngredient.amount_in_grams * multiplier)}g` : '--'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
                </View>
        )}

        {/* Tab Mô tả / Cách làm */}
        <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Mô tả & Cách làm</Text>
            {food.cooking || food.description ? (
                <View className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <Text className="text-gray-700 leading-6 text-[15px]">
                        {food.cooking || food.description}
                    </Text>
                </View>
            ) : (
                <Text className="text-gray-400 italic">Chưa có thông tin mô tả chi tiết.</Text>
            )}
        </View>

      </ScrollView>

      {/* Floating Button */}
      <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
        <TouchableOpacity 
            className="bg-primary flex-row justify-center items-center py-4 rounded-full shadow-sm" 
            onPress={() => setShowAddModal(true)}
        >
          <CheckIcon size={24} color="#fff" />
          <Text className="text-white text-lg font-bold ml-2">Thêm vào Nhật ký</Text>
        </TouchableOpacity>
      </View>

      {/* PB_23: POPUP MODAL */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-[30px] p-6 shadow-xl h-[50%]">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-bold text-gray-800">Thêm vào Nhật ký</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(false)} className="p-2 bg-gray-100 rounded-full">
                        <XMarkIcon size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <Text className="text-base font-semibold text-gray-500 mb-3">Chọn bữa ăn</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {MEAL_TYPES.map((meal) => (
                        <TouchableOpacity 
                            key={meal.id} 
                            className={`py-2 px-5 rounded-full border ${selectedMeal === meal.id ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                            onPress={() => setSelectedMeal(meal.id)}
                        >
                            <Text className={`font-medium ${selectedMeal === meal.id ? 'text-white' : 'text-gray-800'}`}>{meal.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-base font-semibold text-gray-500 mb-3">Xác nhận số lượng</Text>
                <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-8">
                     <View className="flex-row items-center">
                        <TouchableOpacity 
                            onPress={() => setAmount((parseFloat(amount) > 0.5 ? parseFloat(amount) - 0.5 : 0).toString())}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
                        >
                            <Text className="text-xl font-bold text-primary">-</Text>
                        </TouchableOpacity>
                        <TextInput 
                            value={amount}
                            onChangeText={setAmount}
                            className="mx-4 text-2xl font-bold text-gray-800 min-w-[50px] text-center"
                            keyboardType="numeric"
                        />
                         <TouchableOpacity 
                            onPress={() => setAmount((parseFloat(amount) + 0.5).toString())}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200"
                        >
                            <Text className="text-xl font-bold text-primary">+</Text>
                        </TouchableOpacity>
                     </View>
                     <Text className="text-lg font-medium text-gray-600">{food.serving_unit || 'Suất'}</Text>
                </View>

                <TouchableOpacity 
                    className="bg-primary flex-row justify-center items-center py-4 rounded-2xl" 
                    onPress={handleAddToDiary}
                >
                    <CheckIcon size={24} color="#fff" />
                    <Text className="text-white text-lg font-bold ml-2">Lưu vào Nhật ký</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

// Sub-component hiển thị Macro
const MacroItem = ({ label, val, color }: any) => (
  <View className="items-center flex-1">
    <Text className={`font-bold text-lg ${color}`}>{val}g</Text>
    <Text className="text-xs text-gray-500 mt-1">{label}</Text>
  </View>
);
