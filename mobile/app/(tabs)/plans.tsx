import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SparklesIcon, HeartIcon } from "react-native-heroicons/outline";

export default function PlansScreen() {
  const [tab, setTab] = useState('suggest'); // 'suggest' | 'mine'

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Kế hoạch ăn uống</Text>

      {/* Tabs con */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, tab === 'suggest' && styles.tabActive]}
            onPress={() => setTab('suggest')}
          >
            <Text style={[styles.tabText, tab === 'suggest' && styles.textActive]}>Gợi ý cho bạn</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, tab === 'mine' && styles.tabActive]}
            onPress={() => setTab('mine')}
          >
            <Text style={[styles.tabText, tab === 'mine' && styles.textActive]}>Của tôi</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'suggest' ? (
          <>
            {/* Banner Gợi ý ngày mai */}
            <View style={styles.suggestCard}>
              <View style={styles.badge}>
                <SparklesIcon size={14} color="#fff" />
                <Text style={styles.badgeText}>AI Suggestion</Text>
              </View>
              <Text style={styles.cardTitle}>Thực đơn ngày mai</Text>
              <Text style={styles.cardDesc}>1,800 kcal • Giàu Protein • Dễ nấu</Text>
              <View style={styles.foodRow}>
                <Text style={styles.foodEmoji}>🥪</Text>
                <Text style={styles.foodEmoji}>🥗</Text>
                <Text style={styles.foodEmoji}>🐟</Text>
              </View>
              <TouchableOpacity style={styles.applyBtn}>
                <Text style={styles.applyText}>Xem & Áp dụng</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Khám phá món mới</Text>
            {/* List món gợi ý */}
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.dishCard}>
                <View style={styles.dishImg}><Text style={{fontSize: 30}}>🍲</Text></View>
                <View style={{flex: 1}}>
                  <Text style={styles.dishName}>Salad Ức Gà Sốt Chanh</Text>
                  <Text style={styles.dishInfo}>350 kcal • 15 phút</Text>
                </View>
                <TouchableOpacity><HeartIcon size={24} color={Colors.gray}/></TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <HeartIcon size={50} color="#DDD" />
            <Text style={{color: Colors.gray, marginTop: 10}}>Chưa có thực đơn đã lưu</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15 },
  
  tabWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#EEE', borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff', elevation: 2 },
  tabText: { fontWeight: '600', color: Colors.gray },
  textActive: { color: Colors.text },

  content: { paddingHorizontal: 20, paddingBottom: 100 },

  suggestCard: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 20, marginBottom: 25 },
  badge: { flexDirection: 'row', backgroundColor: Colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5 },
  cardDesc: { color: '#1B5E20', marginBottom: 15 },
  foodRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  foodEmoji: { fontSize: 32, backgroundColor: '#fff', padding: 8, borderRadius: 12, overflow: 'hidden' },
  applyBtn: { backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  applyText: { color: '#fff', fontWeight: 'bold' },

  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  dishCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 10, alignItems: 'center', elevation: 1 },
  dishImg: { width: 60, height: 60, backgroundColor: '#F5F5F5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dishName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  dishInfo: { fontSize: 13, color: Colors.gray },
  emptyState: { alignItems: 'center', marginTop: 50 },
});