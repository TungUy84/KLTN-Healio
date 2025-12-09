import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ChevronLeftIcon, MagnifyingGlassIcon, PlusIcon, HeartIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartSolid } from "react-native-heroicons/solid";

// Dữ liệu giả lập (Mock Data)
const FOOD_DB = [
  { id: '1', name: 'Phở Bò Tái', cal: 456, p: 20, c: 58, f: 12, icon: '🍜' },
  { id: '2', name: 'Cơm Tấm Sườn', cal: 620, p: 25, c: 80, f: 22, icon: '🍛' },
  { id: '3', name: 'Bánh Mì Thịt', cal: 400, p: 15, c: 45, f: 18, icon: '🥖' },
  { id: '4', name: 'Ức Gà Luộc', cal: 165, p: 31, c: 0, f: 3.6, icon: '🍗' },
  { id: '5', name: 'Rau Muống Xào', cal: 120, p: 3, c: 8, f: 9, icon: '🥬' },
];

export default function SearchFoodScreen() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('search'); // 'search' | 'favorite'

  // Lọc món ăn
  const filteredFood = FOOD_DB.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectFood = (food: any) => {
    // Chuyển sang màn hình chi tiết món ăn
    router.push({
      pathname: '/food-detail',
      params: { 
        id: food.id,
        name: food.name,
        cal: food.cal,
        p: food.p,
        c: food.c,
        f: food.f,
        icon: food.icon
      } as any
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeftIcon size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm món ăn</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MagnifyingGlassIcon size={20} color={Colors.gray} style={{marginRight: 10}}/>
        <TextInput
          style={styles.input}
          placeholder="Tìm phở, cơm tấm, ức gà..."
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {/* Tabs con */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'search' && styles.tabActive]}
          onPress={() => setTab('search')}
        >
          <Text style={[styles.tabText, tab === 'search' && styles.textActive]}>Tìm kiếm</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'favorite' && styles.tabActive]}
          onPress={() => setTab('favorite')}
        >
          <Text style={[styles.tabText, tab === 'favorite' && styles.textActive]}>Yêu thích</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách món ăn */}
      <FlatList
        data={tab === 'search' ? filteredFood : []} // Tab yêu thích để trống demo
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={
          <View style={{alignItems: 'center', marginTop: 50}}>
            <Text style={{fontSize: 40}}>🥗</Text>
            <Text style={{color: Colors.gray, marginTop: 10}}>Không tìm thấy món ăn nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
            <View style={styles.foodIcon}>
              <Text style={{fontSize: 28}}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDesc}>{item.cal} kcal • {item.p}g Protein</Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <PlusIcon size={20} color={Colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  iconBtn: { padding: 4 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', marginHorizontal: 20, paddingHorizontal: 15, height: 50, borderRadius: 12, marginBottom: 15 },
  input: { flex: 1, fontSize: 16, height: '100%' },

  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15 },
  tabBtn: { marginRight: 20, paddingBottom: 5 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 16, color: Colors.gray, fontWeight: '500' },
  textActive: { color: Colors.primary, fontWeight: 'bold' },

  foodItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  foodIcon: { width: 48, height: 48, backgroundColor: '#F9F9F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  foodName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  foodDesc: { fontSize: 13, color: Colors.gray },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
});