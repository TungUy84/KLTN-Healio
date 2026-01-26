import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PlusIcon, XMarkIcon } from "react-native-heroicons/outline";
import { userService } from '../../services/userService';
import { useIsFocused } from '@react-navigation/native'; // Refresh when tab focused

export default function ProgressScreen() {
  const isFocused = useIsFocused();
  const [history, setHistory] = useState<any[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [logging, setLogging] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const logs = await userService.getWeightHistory();
      setHistory(logs);

      // Get current weight from latest log OR profile
      if (logs.length > 0) {
        setCurrentWeight(logs[logs.length - 1].weight);
      } else {
        try {
          const profile = await userService.getProfile();
          if (profile.UserProfile?.current_weight) {
            setCurrentWeight(profile.UserProfile.current_weight);
          }
        } catch (e) { }
      }

    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tiến độ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const handleLogWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số cân hợp lệ');
      return;
    }
    try {
      setLogging(true);
      await userService.logWeight(parseFloat(newWeight));
      setModalVisible(false);
      setNewWeight('');
      Alert.alert('Thành công', 'Đã ghi nhận cân nặng hôm nay');
      fetchData(); // Refresh
    } catch (e) {
      Alert.alert('Lỗi', 'Ghi nhận thất bại');
    } finally {
      setLogging(false);
    }
  };

  // Logic for Chart (Last 5 entries)
  const chartData = history.slice(-5);
  // Find min/max to normalize
  const weights = chartData.map(d => d.weight);
  const maxW = Math.max(...weights, currentWeight + 5);
  const minW = Math.min(...weights, currentWeight - 5);
  const range = maxW - minW || 1; // avoid div by 0

  const getBarHeight = (w: number) => {
    // Normalize to 30px - 140px height
    return 30 + ((w - minW) / range) * 110;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tiến độ của bạn</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card cân nặng hiện tại */}
        <View style={styles.weightCard}>
          <Text style={styles.cardLabel}>Cân nặng hiện tại</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.bigNum}>{currentWeight || '--'}</Text>
            <Text style={styles.unit}>kg</Text>
          </View>

          <Text style={styles.diff}>
            {history.length > 1
              ? `${history[history.length - 1].weight < history[history.length - 2].weight ? '🔻 Giảm' : '🔺 Tăng'} ${Math.abs(history[history.length - 1].weight - history[history.length - 2].weight).toFixed(1)}kg so với lần trước`
              : 'Chưa có đủ dữ liệu để so sánh'
            }
          </Text>

          <TouchableOpacity style={styles.updateBtn} onPress={() => setModalVisible(true)}>
            <PlusIcon size={20} color="#fff" />
            <Text style={styles.updateText}>Cập nhật hôm nay</Text>
          </TouchableOpacity>
        </View>

        {/* Biểu đồ thay đổi - Dynamic */}
        <Text style={styles.sectionHeader}>Biểu đồ thay đổi</Text>
        <View style={styles.chartContainer}>
          {chartData.length === 0 ? (
            <Text style={{ color: Colors.gray, textAlign: 'center', marginTop: 50 }}>Chưa có dữ liệu biểu đồ</Text>
          ) : (
            <View style={styles.chartBars}>
              {chartData.map((d, index) => (
                <View key={index} style={{ alignItems: 'center', width: 40 }}>
                  <Text style={{ fontSize: 10, color: Colors.gray, marginBottom: 4 }}>{d.weight}</Text>
                  <View style={[styles.bar, {
                    height: getBarHeight(d.weight),
                    backgroundColor: index === chartData.length - 1 ? Colors.primary : '#E0E0E0'
                  }]} />
                  <Text style={styles.dateText}>{new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Lịch sử */}
        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>Lịch sử ghi nhận</Text>
        {history.slice().reverse().map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString('vi-VN')}</Text>
            <Text style={styles.historyVal}>{item.weight} kg</Text>
          </View>
        ))}
        {history.length === 0 && <Text style={{ color: Colors.gray, fontStyle: 'italic' }}>Chưa có lịch sử.</Text>}
      </ScrollView>

      {/* Modal Add Weight */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật cân nặng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <XMarkIcon size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={styles.label}>Nhập cân nặng (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newWeight}
                onChangeText={setNewWeight}
                autoFocus
                placeholder="VD: 65.5"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleLogWeight} disabled={logging}>
                {logging ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu lại</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 50 },

  weightCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 2, marginBottom: 30 },
  cardLabel: { color: Colors.gray, marginBottom: 5 },
  bigNum: { fontSize: 48, fontWeight: 'bold', color: Colors.text },
  unit: { fontSize: 18, color: Colors.gray, marginBottom: 10, marginLeft: 5 },
  diff: { color: '#4CAF50', fontWeight: '500', marginBottom: 20 },
  updateBtn: { flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  updateText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  chartContainer: { height: 180, backgroundColor: '#fff', borderRadius: 16, padding: 15, justifyContent: 'center' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150 },
  bar: { width: 12, borderRadius: 6 },
  dateText: { marginTop: 8, fontSize: 10, color: Colors.gray },

  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  historyDate: { color: Colors.gray },
  historyVal: { fontWeight: 'bold', color: Colors.text },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  modalTitle: { fontWeight: 'bold', fontSize: 18 },
  label: { marginBottom: 10, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 20 },
  saveBtn: { backgroundColor: Colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});