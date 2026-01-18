import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  Dimensions, 
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MagnifyingGlassIcon, 
  ArrowLeftIcon,
  FireIcon
} from "react-native-heroicons/solid";
import { foodService, Food } from '../../services/foodService';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; 

export default function FoodSearchScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(true); // Default to searching mode on entry
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Focus Input on Mount logic (Need a ref if we want to auto-focus, passing autoFocus prop works mostly)
  
  // Custom Back handling
  const handleBack = () => {
      if (submittedQuery) {
          // If viewing results, go back to suggestion input
          setSubmittedQuery('');
          setIsSearching(true);
      } else {
          router.back();
      }
  };

  // Fetch Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
        if (!query || query === submittedQuery) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await foodService.search({ search: query, limit: 10 });
            const names = Array.from(new Set(res.data.map(f => f.name)));
            setSuggestions(names);
        } catch (error) {
            console.log(error);
        }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, submittedQuery]);


  // Search Results Fetch
  const fetchFoods = async (isLoadMore = false) => {
    if (loading || !submittedQuery) return;
    try {
      setLoading(true);
      
      const filterParams: any = { 
          limit: 20, 
          page: isLoadMore ? page : 1,
          search: submittedQuery
      };

      const res = await foodService.search(filterParams);
      
      if (isLoadMore) {
          setFoods(prev => [...prev, ...res.data]);
      } else {
          setFoods(res.data);
      }
      
      setHasMore(res.data.length >= filterParams.limit);

    } catch (error) {
      console.error('Fetch search results error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
     if (submittedQuery) {
        setPage(1);
        setFoods([]);
        setHasMore(true);
        fetchFoods(false);
     }
  }, [submittedQuery]);

  useEffect(() => {
      if (page > 1 && submittedQuery) fetchFoods(true);
  }, [page]);


  const onSubmitSearch = () => {
    if (!query.trim()) return;
    setSubmittedQuery(query);
    setIsSearching(false);
  };

  const onSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setSubmittedQuery(suggestion);
    setIsSearching(false);
  };

  const loadMore = () => {
      if (!loading && hasMore && foods.length > 0) {
          setPage(prev => prev + 1);
      }
  };

  const handleSelectFood = (food: Food) => {
     // Search results generally contextless or current time? 
     // Let's default to 'snack' or current time since we don't know the user's intent from search
     const hour = new Date().getHours();
     let contextMeal = 'snack';
     if (hour >= 4 && hour < 11) contextMeal = 'breakfast';
     else if (hour >= 11 && hour < 14) contextMeal = 'lunch';
     else if (hour >= 14 && hour < 18) contextMeal = 'snack'; 
     else if (hour >= 18 && hour < 22) contextMeal = 'dinner';

     router.push({
      pathname: '/food/food-detail',
      params: { 
        id: food.id,
        mealType: contextMeal
      }
    });
  };

  const renderFoodCard = ({ item }: { item: Food }) => (
    <TouchableOpacity 
        className="bg-white rounded-2xl mb-5 shadow-sm border border-gray-100/50 pb-3"
        style={{ width: COLUMN_WIDTH }} 
        onPress={() => handleSelectFood(item)}
        activeOpacity={0.7}
    >
        <View className="h-32 rounded-t-2xl overflow-hidden bg-gray-50 relative">
             {item.image ? (
                <Image 
                    source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${item.image}` }} 
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <View className="w-full h-full items-center justify-center">
                    <Text className="text-3xl">🍲</Text>
                </View>
            )}
        </View>
        
        <View className="px-3 pt-3">
            <Text className="font-bold text-gray-800 text-[15px] leading-5 mb-1" numberOfLines={1}>
                {item.name}
            </Text>
             <Text className="text-xs text-gray-400 mb-2 h-8" numberOfLines={2}>
                {item.cooking || item.description || 'Chưa có mô tả'}
            </Text>

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <FireIcon size={14} color="#EF4444" />
                    <Text className="text-xs font-bold text-gray-700 ml-1">
                        {Math.round(item.calories)} Kcal
                    </Text>
                </View>
                <View className="bg-gray-50 w-6 h-6 rounded-full items-center justify-center border border-gray-100">
                    <Text className="text-gray-400 text-xs">+</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header Search Bar */}
      <View className="px-5 py-3 flex-row items-center border-b border-gray-50">
          <TouchableOpacity onPress={handleBack} className="mr-3">
              <ArrowLeftIcon size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
                <MagnifyingGlassIcon size={20} color="#9CA3AF" />
                <TextInput
                    className="flex-1 ml-3 text-base text-gray-800 py-1"
                    placeholder="Tìm món ăn..."
                    value={query}
                    autoFocus={true}
                    onChangeText={(text) => {
                        setQuery(text);
                        if (!isSearching) setIsSearching(true);
                    }}
                    onFocus={() => setIsSearching(true)}
                    onSubmitEditing={onSubmitSearch}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="search"
                />
                 {query.length > 0 && (
                     <TouchableOpacity onPress={() => {
                         setQuery('');
                         setSubmittedQuery('');
                         setSuggestions([]);
                         setIsSearching(true);
                     }}>
                         <Text className="text-gray-400 font-bold px-2">✕</Text>
                     </TouchableOpacity>
                 )}
            </View>
      </View>

      <View className="flex-1 bg-gray-50/30">
        {isSearching || !submittedQuery ? (
           <View className="bg-white flex-1 px-5 pt-2">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-3 mt-2">Gợi ý tìm kiếm</Text>
                {suggestions.length > 0 ? (
                    suggestions.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        className="py-3 border-b border-gray-50 flex-row items-center"
                        onPress={() => onSelectSuggestion(item)}
                    >
                        <MagnifyingGlassIcon size={16} color="#9CA3AF" />
                        <Text className="ml-3 text-gray-600 text-base">{item}</Text>
                    </TouchableOpacity>
                    ))
                ) : (
                    <Text className="text-gray-400 italic mt-2 text-center">Nhập tên món ăn để tìm kiếm...</Text>
                )}
            </View>
        ) : (
            <>
                 <View className="px-5 py-4 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-800">
                        Kết quả cho "{submittedQuery}"
                    </Text>
                </View>

                <FlatList
                    data={foods}
                    key={`grid-${2}`} 
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        !loading ? (
                            <View className="items-center mt-20 opacity-40">
                                <MagnifyingGlassIcon size={40} color="#9CA3AF" />
                                <Text className="text-gray-500 text-lg font-medium mt-4">Không tìm thấy món ăn</Text>
                            </View>
                        ) : null
                    }
                    renderItem={renderFoodCard}
                    ListFooterComponent={loading ? <ActivityIndicator className="mt-4" size="large" color={Colors.primary} /> : <View className="h-20"/>}
                />
            </>
        )}
      </View>
    </SafeAreaView>
  );
}
