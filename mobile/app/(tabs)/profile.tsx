import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ChevronRightIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "react-native-heroicons/outline";

export default function ProfileScreen() {
  const MenuItem = ({ title, value, icon, isDestructive }: any) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {icon}
        <Text style={[styles.menuText, isDestructive && {color: 'red'}]}>{title}</Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <ChevronRightIcon size={16} color="#CCC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <Cog6ToothIcon size={24} color={Colors.text} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={{fontSize: 30}}>🧑‍💻</Text>
          </View>
          <View>
            <Text style={styles.userName}>Nguyễn Văn An</Text>
            <Text style={styles.userEmail}>an.nguyen@example.com</Text>
          </View>
        </View>

        {/* Goals */}
        <Text style={styles.sectionHeader}>Quản lý Mục tiêu</Text>
        <View style={styles.menuGroup}>
          <MenuItem title="Mục tiêu hiện tại" value="Giảm cân" />
          <MenuItem title="Cân nặng hiện tại" value="65.5 kg" />
          <MenuItem title="Mức độ vận động" value="Vừa phải" />
        </View>

        {/* Settings */}
        <Text style={styles.sectionHeader}>Cài đặt & Hỗ trợ</Text>
        <View style={styles.menuGroup}>
          <MenuItem title="Cài đặt thông báo" />
          <MenuItem title="Ngôn ngữ" value="Tiếng Việt" />
          <MenuItem title="Trợ giúp & Hỗ trợ" />
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <ArrowRightOnRectangleIcon size={20} color="red" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  content: { paddingHorizontal: 20, paddingBottom: 50 },

  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  avatar: { width: 70, height: 70, backgroundColor: '#E8F5E9', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  userName: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  userEmail: { color: Colors.gray },

  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: Colors.gray, marginBottom: 10, marginTop: 10, textTransform: 'uppercase' },
  menuGroup: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, marginBottom: 10 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuText: { fontSize: 16, fontWeight: '500', marginLeft: 0 },
  menuValue: { color: Colors.primary, fontWeight: '600', marginRight: 10 },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30, padding: 15 },
  logoutText: { color: 'red', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});