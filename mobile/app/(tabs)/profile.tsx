import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { userService, UserProfileUpdate } from '../../services/userService';
import { rawFoodService } from '../../services/rawFoodService';
import { LinearGradient } from 'expo-linear-gradient';

// --- CONSTANTS ---

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Ít vận động', sub: 'Văn phòng, ít tập thể dục', icon: 'tv' },
  { id: 'light', label: 'Nhẹ nhàng', sub: '1-3 ngày tập luyện / tuần', icon: 'user' },
  { id: 'moderate', label: 'Vừa phải', sub: '3-5 ngày tập luyện / tuần', icon: 'play-circle' },
  { id: 'active', label: 'Năng động', sub: '6-7 ngày tập luyện / tuần', icon: 'zap' },
  { id: 'very_active', label: 'Rất năng động', sub: 'Vận động cường độ cao', icon: 'activity' },
];

const DIET_MODES_UI: Record<string, { name: string, icon: any, color: string, colorBg: string, borderColor: string }> = {
  'weight_loss': { name: 'Giảm cân', icon: 'trending-down', color: '#10B981', colorBg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  'balanced': { name: 'Cân bằng', icon: 'layers', color: '#3B82F6', colorBg: 'bg-blue-50', borderColor: 'border-blue-200' },
  'muscle_gain': { name: 'Tăng cơ', icon: 'zap', color: '#F59E0B', colorBg: 'bg-amber-50', borderColor: 'border-amber-200' },
  'keto': { name: 'Keto', icon: 'battery-charging', color: '#EF4444', colorBg: 'bg-red-50', borderColor: 'border-red-200' },
  'low_carb': { name: 'Low Carb', icon: 'slash', color: '#8B5CF6', colorBg: 'bg-violet-50', borderColor: 'border-violet-200' },
};

const getBMI = (height: number, weight: number) => {
  if (!height || !weight) return { value: 0, label: '—', color: 'text-slate-400', bg: 'bg-slate-100' };
  const h = height / 100;
  const bmi = parseFloat((weight / (h * h)).toFixed(1));
  if (bmi < 18.5) return { value: bmi, label: 'Thiếu cân', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (bmi < 23) return { value: bmi, label: 'Bình thường', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  if (bmi < 25) return { value: bmi, label: 'Thừa cân', color: 'text-orange-600', bg: 'bg-orange-100' };
  return { value: bmi, label: 'Béo phì', color: 'text-red-600', bg: 'bg-red-100' };
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState<'info' | 'allergies' | 'password' | null>(null);
  const [formData, setFormData] = useState<UserProfileUpdate>({});
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [dietPresets, setDietPresets] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, dietData] = await Promise.all([userService.getProfile(), userService.getDietPresets()]);
      setProfile(profileData);
      setDietPresets(dietData);
    } catch (error) { Alert.alert('Lỗi', 'Không thể tải dữ liệu'); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('token');
          router.replace('/auth/sign-in');
        }
      }
    ]);
  };

  const updateDietMode = async (dietCode: string) => {
    try { await userService.updateProfile({ diet_preset_code: dietCode }); await loadData(); }
    catch (e) { Alert.alert('Lỗi', 'Không thể đổi chế độ ăn'); }
  };

  const updateActivityLevel = async (level: string) => {
    try {
      const newProfile = { ...profile, UserProfile: { ...profile.UserProfile, activity_level: level } };
      setProfile(newProfile); // Optimistic
      await userService.updateProfile({ activity_level: level });
      const updated = await userService.getProfile();
      setProfile(updated);
    } catch (e) { loadData(); }
  };

  const openEditInfo = () => {
    if (!profile) return;
    const p = profile.UserProfile || {};
    setFormData({ full_name: profile.full_name, dob: p.dob, height: p.height, current_weight: p.current_weight, goal_weight: p.goal_weight, gender: p.gender });
    setEditMode('info'); setModalVisible(true);
  };

  const handleSave = async (action: () => Promise<void>) => {
    try { setSaving(true); await action(); setModalVisible(false); await loadData(); Alert.alert('Thành công', 'Đã cập nhật'); }
    catch (e) { Alert.alert('Lỗi', 'Cập nhật thất bại'); } finally { setSaving(false); }
  }

  // Search Logic for Allergies
  useEffect(() => {
    if (editMode !== 'allergies' || searchQuery.length <= 1) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try { const res = await rawFoodService.search(searchQuery); setSearchResults(res.data || []); }
      catch (e) { } finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, editMode]);

  const handleAvatarEdit = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) {
      const asset = result.assets[0];
      const data = new FormData();
      // @ts-ignore
      data.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' });
      setLoading(true);
      try { await userService.uploadAvatar(data); await loadData(); } catch (e) { Alert.alert('Lỗi Upload'); } finally { setLoading(false); }
    }
  };

  // --- RENDERS ---

  if (loading && !profile) return <View className="flex-1 justify-center items-center bg-[#F8FAFC]"><ActivityIndicator size="large" color="#0D9488" /></View>;
  if (!profile) return null;

  const p = profile.UserProfile || {};
  const n = profile.UserNutritionTarget || {};
  const bmi = getBMI(p.height, p.current_weight);

  const InfoRow = ({ label, value, sub }: any) => (
    <View className="items-center">
      <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{label}</Text>
      <Text className="text-slate-800 text-xl font-bold">{value}</Text>
      {sub && <Text className="text-slate-400 text-xs">{sub}</Text>}
    </View>
  );

  const SettingsParams = ({ icon, label, value, onPress, isDestructive }: any) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <View className="flex-row items-center">
        <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${isDestructive ? 'bg-red-50' : 'bg-slate-50'}`}>
          <Feather name={icon} size={16} color={isDestructive ? '#EF4444' : '#64748B'} />
        </View>
        <Text className={`font-medium text-[15px] ${isDestructive ? 'text-red-500' : 'text-slate-700'}`}>{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-slate-400 text-sm mr-2">{value}</Text>}
        <Feather name="chevron-right" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="px-5 pt-2 pb-4 bg-white shadow-sm shadow-slate-100 z-10 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-slate-800">Tài khoản</Text>
        <TouchableOpacity><Feather name="settings" size={22} color="#475569" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Profile Header */}
        <View className="items-center mt-8 mb-6">
          <View className="relative">
            <View className="w-28 h-28 rounded-full border-[3px] border-white shadow-lg shadow-teal-500/20 overflow-hidden">
              <Image source={{ uri: profile.avatar?.startsWith('http') ? profile.avatar : 'https://ui-avatars.com/api/?background=0D9488&color=fff&name=' + profile.full_name }} className="w-full h-full" />
            </View>
            <TouchableOpacity onPress={handleAvatarEdit} className="absolute bottom-0 right-0 bg-teal-600 p-2 rounded-full border-2 border-white shadow-sm">
              <Feather name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-slate-800 mt-4">{profile.full_name}</Text>
          <Text className="text-slate-500 text-sm">{profile.email}</Text>
        </View>

        {/* Stats Grid */}
        <View className="mx-5 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex-row justify-between mb-6">
          <InfoRow label="BMI" value={bmi.value} sub={bmi.label} />
          <View className="w-[1px] h-full bg-slate-100" />
          <InfoRow label="TDEE" value={n.tdee} sub="kcal/ngày" />
          <View className="w-[1px] h-full bg-slate-100" />
          <InfoRow label="Cân nặng" value={`${p.current_weight}kg`} sub={`Mục tiêu: ${p.goal_weight}`} />
        </View>

        {/* Diet Mode */}
        <View className="mb-8">
          <Text className="px-5 text-base font-bold text-slate-800 mb-3">Chế độ dinh dưỡng</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {(dietPresets.length > 0 ? dietPresets : Object.keys(DIET_MODES_UI).map(k => ({ code: k, ...DIET_MODES_UI[k] }))).map((preset: any) => {
              const ui = DIET_MODES_UI[preset.code.toLowerCase()] || DIET_MODES_UI['balanced'];
              const isActive = profile?.UserNutritionTarget?.DietPreset?.code === preset.code;
              return (
                <TouchableOpacity
                  key={preset.code} onPress={() => updateDietMode(preset.code)}
                  className={`mr-3 w-32 p-4 rounded-2xl border bg-white ${isActive ? `border-teal-500 shadow-sm shadow-teal-500/20` : 'border-slate-100'}`}
                >
                  <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${ui.colorBg}`}>
                    <Feather name={ui.icon} size={18} color={ui.color} />
                  </View>
                  <Text className={`font-bold mb-1 ${isActive ? 'text-teal-700' : 'text-slate-700'}`}>{ui.name || preset.name}</Text>
                  {isActive && <View className="absolute top-3 right-3 w-2 h-2 rounded-full bg-teal-500" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Settings Group */}
        <View className="mx-5 bg-white rounded-3xl p-2 shadow-sm border border-slate-100 mb-8">
          <SettingsParams icon="user" label="Thông tin cá nhân" onPress={openEditInfo} />
          <SettingsParams icon="activity" label="Mức độ vận động" value={ACTIVITY_LEVELS.find(a => a.id === p.activity_level)?.label} onPress={() => { }} />
          <SettingsParams icon="alert-circle" label="Dị ứng & Kiêng kỵ" value={p.allergies?.length ? `${p.allergies.length} món` : ''} onPress={() => { setEditMode('allergies'); setSelectedAllergies(p.allergies || []); setModalVisible(true); }} />
          <SettingsParams icon="lock" label="Đổi mật khẩu" onPress={() => { setEditMode('password'); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); setModalVisible(true); }} />
          <SettingsParams icon="log-out" label="Đăng xuất" isDestructive onPress={handleLogout} />
        </View>

        <Text className="text-center text-slate-300 text-xs mb-8">Version 1.0.0 (Build 240)</Text>

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#F8FAFC] mt-4">
          <View className="bg-white px-5 py-4 border-b border-slate-100 flex-row justify-between items-center">
            <Text className="font-bold text-lg text-slate-800">{editMode === 'info' ? 'Sửa thông tin' : editMode === 'allergies' ? 'Dị ứng' : 'Đổi mật khẩu'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full"><Feather name="x" size={20} /></TouchableOpacity>
          </View>

          {editMode === 'info' && (
            <ScrollView className="p-5">
              <View className="bg-white p-4 rounded-2xl mb-4 border border-slate-100">
                <Text className="text-xs text-slate-400 mb-1 font-bold uppercase">Họ tên</Text>
                <TextInput value={formData.full_name} onChangeText={t => setFormData({ ...formData, full_name: t })} className="py-2 text-base border-b border-slate-100 text-slate-800 font-medium" />

                <View className="flex-row gap-4 mt-4">
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 mb-1 font-bold uppercase">Chiều cao (cm)</Text>
                    <TextInput value={formData.height?.toString()} keyboardType="numeric" onChangeText={t => setFormData({ ...formData, height: parseFloat(t) || 0 })} className="py-2 text-base border-b border-slate-100 text-slate-800 font-medium" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 mb-1 font-bold uppercase">Ngày sinh</Text>
                    <TextInput value={formData.dob} placeholder="YYYY-MM-DD" onChangeText={t => setFormData({ ...formData, dob: t })} className="py-2 text-base border-b border-slate-100 text-slate-800 font-medium" />
                  </View>
                </View>
              </View>

              <View className="bg-white p-4 rounded-2xl mb-6 border border-slate-100">
                <Text className="text-xs text-slate-400 mb-1 font-bold uppercase">Cân nặng (kg)</Text>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 mt-2">Hiện tại</Text>
                    <TextInput value={formData.current_weight?.toString()} keyboardType="numeric" onChangeText={t => setFormData({ ...formData, current_weight: parseFloat(t) || 0 })} className="py-2 text-base border-b border-slate-100 text-slate-800 font-medium" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-400 mt-2">Mục tiêu</Text>
                    <TextInput value={formData.goal_weight?.toString()} keyboardType="numeric" onChangeText={t => setFormData({ ...formData, goal_weight: parseFloat(t) || 0 })} className="py-2 text-base border-b border-slate-100 text-slate-800 font-medium" />
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={() => handleSave(async () => await userService.updateProfile(formData))} className="bg-teal-600 py-4 rounded-xl items-center shadow-lg shadow-teal-600/30">
                {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Lưu thay đổi</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}

          {editMode === 'allergies' && (
            <View className="flex-1">
              <View className="px-5 py-2 z-20">
                <TextInput className="bg-white border border-slate-200 p-3 rounded-xl" placeholder="Tìm kiếm món dị ứng..." value={searchQuery} onChangeText={setSearchQuery} />
                {searchResults.length > 0 && (
                  <View className="absolute top-[60px] left-5 right-5 bg-white rounded-xl shadow-lg border border-slate-100 z-50 max-h-40">
                    {searchResults.map((item: any) => (
                      <TouchableOpacity key={item.id} onPress={() => { setSelectedAllergies([...selectedAllergies, item.name]); setSearchQuery(''); setSearchResults([]); }} className="p-3 border-b border-slate-50 last:border-0">
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <ScrollView className="flex-1 px-5 pt-4">
                <View className="flex-row flex-wrap gap-2">
                  {selectedAllergies.map((a, i) => (
                    <TouchableOpacity key={i} onPress={() => setSelectedAllergies(selectedAllergies.filter(x => x !== a))} className="bg-red-50 flex-row items-center px-3 py-1.5 rounded-full border border-red-100">
                      <Text className="text-red-600 mr-2">{a}</Text>
                      <Feather name="x" size={12} color="#DC2626" />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View className="p-5 bg-white border-t border-slate-100">
                <TouchableOpacity onPress={() => handleSave(async () => await userService.updateProfile({ allergies: selectedAllergies }))} className="bg-teal-600 py-4 rounded-xl items-center shadow-lg">
                  <Text className="text-white font-bold">Lưu danh sách</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
