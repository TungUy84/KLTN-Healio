import React, { useState } from 'react';
// Đảm bảo đã import TextInput
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ChevronLeftIcon, HeartIcon, CheckIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartSolid } from "react-native-heroicons/solid";

// Giả lập các đơn vị đo lường (Serving Sizes)
const SERVING_SIZES = [
  { id: 'g', label: 'Gram (g)', ratio: 1 },
  { id: 'bowl', label: '1 Tô vừa', ratio: 5.5 }, // 1 tô = 550g
  { id: 'plate', label: '1 Đĩa', ratio: 4.0 },   // 1 đĩa = 400g
];

export default function FoodDetailScreen() {
  const params = useLocalSearchParams();
  const [amount, setAmount] = useState('100'); // Mặc định 100g
  const [unit, setUnit] = useState(SERVING_SIZES[0]); // Mặc định là Gram
  const [isFavorite, setIsFavorite] = useState(false);

  // Nhận dữ liệu dinh dưỡng gốc (trên 100g)
  // Thêm fallback '0' để tránh lỗi nếu dữ liệu null
  const baseCal = parseFloat((params.cal as string) || '0');
  const baseP = parseFloat((params.p as string) || '0');
  const baseC = parseFloat((params.c as string) || '0');
  const baseF = parseFloat((params.f as string) || '0');
  const baseFib = parseFloat((params.fib as string) || '0'); // <-- NHẬN FIBER

  // Logic tính toán: (Số lượng * Tỷ lệ đơn vị * Chỉ số gốc) / 100
  const multiplier = (parseFloat(amount || '0') * unit.ratio) / 100;
  
  const totalCal = Math.round(baseCal * multiplier);
  const totalP = Math.round(baseP * multiplier);
  const totalC = Math.round(baseC * multiplier);
  const totalF = Math.round(baseF * multiplier);
  const totalFib = (baseFib * multiplier).toFixed(1); // <-- TÍNH FIBER (lấy 1 số lẻ)

  const handleAddToDiary = () => {
    Alert.alert("Đã thêm!", `Đã thêm ${params.name} vào nhật ký.\n(Bao gồm ${totalFib}g chất xơ)`, [
      { text: "OK", onPress: () => router.navigate('/(tabs)') }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header Ảnh Món Ăn */}
      <View style={styles.imageHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeftIcon size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{fontSize: 80}}>{params.icon}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.foodName}>{params.name}</Text>
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            {isFavorite ? <HeartSolid size={28} color="red" /> : <HeartIcon size={28} color={Colors.gray} />}
          </TouchableOpacity>
        </View>

        {/* Bộ chọn khẩu phần */}
        <View style={styles.servingBox}>
          <Text style={styles.sectionTitle}>Chọn khẩu phần</Text>
          <View style={styles.selectorRow}>
            {/* Input số lượng */}
            <View style={styles.amountInputBox}>
              <TextInput 
                style={styles.amountInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            
            {/* Chọn đơn vị */}
            <View style={styles.unitRow}>
              {SERVING_SIZES.map((u) => (
                <TouchableOpacity 
                  key={u.id} 
                  style={[styles.unitBadge, unit.id === u.id && styles.unitActive]}
                  onPress={() => {
                    setUnit(u);
                    setAmount(u.id === 'g' ? '100' : '1');
                  }}
                >
                  <Text style={[styles.unitText, unit.id === u.id && styles.textActive]}>{u.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Kết quả Dinh dưỡng */}
        <View style={styles.resultCard}>
          <View style={styles.mainCal}>
            <Text style={styles.calNum}>{totalCal}</Text>
            <Text style={styles.calLabel}>KCAL</Text>
          </View>
          
          <View style={styles.divider} />
          
          {/* Hàng Macro Chính (P-C-F) */}
          <View style={styles.macroRow}>
            <MacroItem label="Protein" val={totalP} color={Colors.secondary} />
            <MacroItem label="Carbs" val={totalC} color={Colors.primary} />
            <MacroItem label="Fat" val={totalF} color="#E53935" />
          </View>

          {/* --- Hàng Vi chất (Mới thêm) --- */}
          <View style={[styles.divider, { marginTop: 15, backgroundColor: '#EEE' }]} />
          <View style={styles.macroRow}>
             {/* Hiển thị Chất xơ */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#795548' }}>{totalFib}g</Text>
              <Text style={{ fontSize: 12, color: Colors.gray }}>Chất xơ</Text>
            </View>
            
            {/* Các ô trống để dành cho Vitamin sau này */}
            <View style={{ alignItems: 'center', flex: 1 }}>
               <Text style={{ fontSize: 12, color: '#DDD' }}>--</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
               <Text style={{ fontSize: 12, color: '#DDD' }}>--</Text>
            </View>
          </View>
        </View>

        {/* Chọn bữa ăn */}
        <Text style={styles.sectionTitle}>Thêm vào bữa</Text>
        <View style={styles.mealOptions}>
          {['Bữa Sáng', 'Bữa Trưa', 'Bữa Tối', 'Ăn Vặt'].map((meal, idx) => (
            <TouchableOpacity key={idx} style={styles.mealChip}>
              <Text style={styles.mealText}>{meal}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Floating Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToDiary}>
          <CheckIcon size={24} color="#fff" />
          <Text style={styles.addText}>Thêm vào Nhật ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Sub-component hiển thị Macro
const MacroItem = ({ label, val, color }: any) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 18, color: color }}>{val}g</Text>
    <Text style={{ fontSize: 12, color: Colors.gray }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageHeader: { height: 250, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 20 },
  
  content: { flex: 1, marginTop: -30, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  foodName: { fontSize: 24, fontWeight: 'bold', color: Colors.text },

  servingBox: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.gray, marginBottom: 10 },
  selectorRow: { flexDirection: 'row', alignItems: 'center' },
  amountInputBox: { width: 80, height: 50, borderWidth: 1, borderColor: '#DDD', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  amountInput: { fontSize: 20, fontWeight: 'bold', color: Colors.text, textAlign: 'center', width: '100%' },
  
  unitRow: { flexDirection: 'row', gap: 10 },
  unitBadge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F5F5F5' },
  unitActive: { backgroundColor: Colors.primary },
  unitText: { color: Colors.gray, fontWeight: '500' },
  textActive: { color: '#fff' },

  resultCard: { backgroundColor: '#FAFAFA', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#F0F0F0' },
  mainCal: { alignItems: 'center', marginBottom: 15 },
  calNum: { fontSize: 48, fontWeight: 'bold', color: Colors.text },
  calLabel: { fontSize: 14, fontWeight: 'bold', color: Colors.gray, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 15 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },

  mealOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 100 },
  mealChip: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, borderColor: '#EEE' },
  mealText: { fontWeight: '500', color: Colors.text },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  addBtn: { backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 30 },
  addText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});