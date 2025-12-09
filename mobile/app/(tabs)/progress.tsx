import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PlusIcon } from "react-native-heroicons/outline";

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tiến độ của bạn</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card cân nặng hiện tại */}
        <View style={styles.weightCard}>
          <Text style={styles.cardLabel}>Cân nặng hiện tại</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.bigNum}>65.5</Text>
            <Text style={styles.unit}>kg</Text>
          </View>
          <Text style={styles.diff}>🔻 Giảm 0.5kg so với tuần trước</Text>
          
          <TouchableOpacity style={styles.updateBtn}>
            <PlusIcon size={20} color="#fff" />
            <Text style={styles.updateText}>Cập nhật hôm nay</Text>
          </TouchableOpacity>
        </View>

        {/* Giả lập Biểu đồ (Placeholder) */}
        <Text style={styles.sectionHeader}>Biểu đồ thay đổi</Text>
        <View style={styles.chartPlaceholder}>
          <View style={[styles.bar, {height: 60}]} />
          <View style={[styles.bar, {height: 80}]} />
          <View style={[styles.bar, {height: 75}]} />
          <View style={[styles.bar, {height: 90}]} />
          <View style={[styles.bar, {height: 85, backgroundColor: Colors.primary}]} />
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>T2</Text>
          <Text style={styles.dateText}>T3</Text>
          <Text style={styles.dateText}>T4</Text>
          <Text style={styles.dateText}>T5</Text>
          <Text style={[styles.dateText, {fontWeight: 'bold', color: Colors.primary}]}>Hôm nay</Text>
        </View>

        {/* Lịch sử */}
        <Text style={[styles.sectionHeader, {marginTop: 30}]}>Lịch sử ghi nhận</Text>
        <View style={styles.historyItem}>
          <Text style={styles.historyDate}>12/10/2023</Text>
          <Text style={styles.historyVal}>65.5 kg</Text>
        </View>
        <View style={styles.historyItem}>
          <Text style={styles.historyDate}>05/10/2023</Text>
          <Text style={styles.historyVal}>66.0 kg</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 20 },
  content: { paddingHorizontal: 20 },

  weightCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 2, marginBottom: 30 },
  cardLabel: { color: Colors.gray, marginBottom: 5 },
  bigNum: { fontSize: 48, fontWeight: 'bold', color: Colors.text },
  unit: { fontSize: 18, color: Colors.gray, marginBottom: 10, marginLeft: 5 },
  diff: { color: '#4CAF50', fontWeight: '500', marginBottom: 20 },
  updateBtn: { flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  updateText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  chartPlaceholder: { flexDirection: 'row', height: 150, alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 },
  bar: { width: 30, backgroundColor: '#E0E0E0', borderRadius: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 },
  dateText: { width: 30, textAlign: 'center', fontSize: 12, color: Colors.gray },

  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  historyDate: { color: Colors.gray },
  historyVal: { fontWeight: 'bold', color: Colors.text },
});