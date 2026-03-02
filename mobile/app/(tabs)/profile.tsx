import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator, Dimensions, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { userService, UserProfileUpdate } from '../../services/userService';
import { rawFoodService } from '../../services/rawFoodService';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Beef, Wheat, Droplet, Target, Zap, Activity, Info, LogOut, ChevronRight, Camera, Edit2, Shield, Calendar } from 'lucide-react-native';



// --- CONSTANTS ---

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Ít vận động', sub: 'Văn phòng, ít tập thể dục', icon: 'tv' },
  { id: 'light', label: 'Nhẹ nhàng', sub: '1-3 ngày tập luyện / tuần', icon: 'user' },
  { id: 'moderate', label: 'Vừa phải', sub: '3-5 ngày tập luyện / tuần', icon: 'play-circle' },
  { id: 'active', label: 'Năng động', sub: '6-7 ngày tập luyện / tuần', icon: 'zap' },
  { id: 'very_active', label: 'Rất năng động', sub: 'Vận động cường độ cao', icon: 'activity' },
];

const PRESET_COLORS = [
  { color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200' },
  { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
  { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200' },
  { color: '#8B5CF6', bg: 'bg-violet-50', border: 'border-violet-200' },
  { color: '#84CC16', bg: 'bg-lime-50', border: 'border-lime-200' },
  { color: '#EC4899', bg: 'bg-pink-50', border: 'border-pink-200' },
];

const PRESET_ICONS = ['activity', 'layers', 'zap', 'target', 'heart', 'star', 'sun'];

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api');

const resolveImg = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_URL.replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};


const getBMI = (height: number, weight: number) => {
  if (!height || !weight) return { value: 0, label: '—', color: '#94A3B8', bg: '#F1F5F9' };
  const h = height / 100;
  const bmi = parseFloat((weight / (h * h)).toFixed(1));
  if (bmi < 18.5) return { value: bmi, label: 'Thiếu cân', color: '#3B82F6', bg: '#EFF6FF' };
  if (bmi < 23) return { value: bmi, label: 'Bình thường', color: '#10B981', bg: '#ECFDF5' };
  if (bmi < 25) return { value: bmi, label: 'Thừa cân', color: '#F59E0B', bg: '#FFFBEB' };
  return { value: bmi, label: 'Béo phì', color: '#EF4444', bg: '#FEF2F2' };
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userInfo');
          router.replace('/auth/sign-in');
        }
      }
    ]);
  };

  const updateDietMode = async (dietCode: string) => {
    try { await userService.updateProfile({ diet_preset_code: dietCode }); await loadData(); }
    catch (e) { Alert.alert('Lỗi', 'Không thể đổi chế độ ăn'); }
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

  if (loading && !profile) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#0D9488" /></View>;
  if (!profile) return null;

  const p = profile.UserProfile || {};
  const n = profile.UserNutritionTarget || {};
  const bmi = getBMI(p.height, p.current_weight);

  const InfoRow = ({ label, value, sub, Icon, color }: any) => (
    <View className="items-center flex-1">
      <View className="w-12 h-12 rounded-[20px] items-center justify-center mb-3" style={{ backgroundColor: `${color}15` }}>
        <Icon size={22} color={color} />
      </View>
      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-1.5">{label}</Text>
      <Text className="text-slate-800 text-[22px] font-black tracking-tighter">{value}</Text>
      {sub && <Text className="text-slate-400 text-[12px] font-bold mt-1">{sub}</Text>}
    </View>
  );

  const SettingsParams = ({ icon, label, value, onPress, isDestructive }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-5 px-4"
    >
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-[18px] items-center justify-center mr-5 ${isDestructive ? 'bg-red-50' : 'bg-white border border-slate-100'}`} style={!isDestructive ? { shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 } : {}}>
          <Feather name={icon} size={20} color={isDestructive ? '#EF4444' : '#334155'} />
        </View>
        <Text className={`font-black text-[17px] tracking-tight ${isDestructive ? 'text-red-500' : 'text-slate-800'}`}>{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-slate-400 font-bold text-xs mr-3">{value}</Text>}
        <ChevronRight size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* HEADER (Sticky Blur - Same as Foods) */}
      <BlurView tint="light" intensity={100} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top + 16, paddingBottom: 16 }}>
        <View className="flex-row justify-between items-center px-6">
          <Text className="text-[26px] font-[900] text-slate-800 tracking-tighter">Tài khoản</Text>
          <TouchableOpacity
            onPress={() => { }}
            className="w-11 h-11 rounded-full bg-white/60 items-center justify-center border border-white/60 shadow-sm shadow-slate-200"
          >
            <Feather name="settings" size={20} color="#475569" />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: insets.top + 95 }}
      >
        {/* Profile Header (Sync Style) */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-10">
          <View className="relative">
            <Animated.View entering={ZoomIn.delay(300).duration(600)} className="w-[140px] h-[140px] rounded-full border-[6px] border-white shadow-2xl shadow-slate-300 bg-slate-50 p-0.5" style={{ elevation: 25 }}>
              <Image
                source={{
                  uri: resolveImg(profile.avatar) ?? ('https://ui-avatars.com/api/?background=0D9488&color=fff&name=')
                }}
                className="w-full h-full rounded-full"
              />
            </Animated.View>
            <TouchableOpacity
              onPress={handleAvatarEdit}
              className="absolute bottom-1 right-1 bg-orange-500 w-11 h-11 items-center justify-center rounded-full border-[5px] border-white shadow-xl shadow-orange-500/40"
            >
              <Camera size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-[30px] font-[900] text-slate-800 mt-6 mb-2 tracking-tighter">{profile.full_name}</Text>
          <View className="bg-slate-100 px-5 py-2 rounded-full border border-slate-200/50">
            <Text className="text-slate-500 font-black text-[12px] uppercase tracking-[2px]">{profile.email}</Text>
          </View>
        </Animated.View>

        {/* Stats Grid (Sync Style with PopularFoodCard style shadow/border) */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-5 mb-12">
          <View
            className="bg-white/90 p-8 rounded-[40px] border border-white/60 shadow-xl shadow-slate-200 flex-row justify-between items-center"
            style={{ shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20 }}
          >
            <InfoRow label="BMI" value={bmi.value} sub={bmi.label} Icon={Activity} color={bmi.color} />
            <View style={{ width: 1.5, height: 50, backgroundColor: '#E2E8F0', opacity: 0.6 }} />
            <InfoRow label="TDEE" value={n.tdee} sub="kcal/ngày" Icon={Zap} color="#F97316" />
            <View style={{ width: 1.5, height: 50, backgroundColor: '#E2E8F0', opacity: 0.6 }} />
            <InfoRow label="Cân nặng" value={`${p.current_weight}kg`} sub={`Mục tiêu: ${p.goal_weight}`} Icon={Target} color="#10B981" />
          </View>
        </Animated.View>

        {/* Diet Mode Sections (Sync Style with Category style) */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-14">
          <View className="flex-row justify-between items-baseline px-6 mb-6">
            <Text className="text-[24px] font-black text-slate-800 tracking-tight">Chế độ dinh dưỡng</Text>
            <TouchableOpacity><Text className="text-orange-500 font-black text-xs uppercase tracking-[1.5px]">Đổi mục tiêu</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {dietPresets.map((preset: any, index: number) => {
              const theme = PRESET_COLORS[index % PRESET_COLORS.length];
              const isActive = profile?.UserNutritionTarget?.DietPreset?.code === preset.code;
              return (
                <TouchableOpacity
                  key={preset.code}
                  onPress={() => updateDietMode(preset.code)}
                  activeOpacity={0.8}
                  className={`mr-4 w-[170px] p-7 rounded-[38px] border ${isActive ? `bg-white border-teal-500 shadow-2xl shadow-teal-500/15` : 'bg-slate-50/50 border-slate-100'}`}
                  style={isActive ? { shadowColor: '#10bcc4', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 20 } : {}}
                >
                  <View className={`w-14 h-14 rounded-[22px] items-center justify-center mb-6 shadow-sm ${theme.bg}`}>
                    <Ionicons name={isActive ? "sparkles" : "leaf-outline"} size={26} color={theme.color} />
                  </View>
                  <Text className={`font-black tracking-tight text-[18px] mb-1.5 ${isActive ? 'text-teal-700' : 'text-slate-800'}`}>{preset.name}</Text>
                  <Text className="text-[12px] text-slate-400 font-black uppercase tracking-wider">{isActive ? 'Đang áp dụng' : 'Xem chi tiết'}</Text>

                  {isActive && (
                    <View className="absolute top-6 right-6 bg-teal-500 w-3.5 h-3.5 rounded-full border-[4px] border-white shadow-sm" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Menu Settings Group (Sync with Large Rounded frames) */}
        <Animated.View entering={FadeInDown.delay(400).springify()} className="px-5 mb-12">
          <View className="bg-slate-50/60 rounded-[45px] p-4 border border-slate-100 shadow-sm shadow-slate-100">
            <SettingsParams icon="user" label="Thông tin cá nhân" onPress={openEditInfo} />
            <View className="h-[1px] bg-slate-200/50 mx-6" />
            <SettingsParams icon="activity" label="Mức độ vận động" value={ACTIVITY_LEVELS.find(a => a.id === p.activity_level)?.label} onPress={() => { }} />
            <View className="h-[1px] bg-slate-200/50 mx-6" />
            <SettingsParams icon="alert-circle" label="Dị ứng & Kiêng kỵ" value={p.allergies?.length ? `${p.allergies.length} món` : ''} onPress={() => { setEditMode('allergies'); setSelectedAllergies(p.allergies || []); setModalVisible(true); }} />
            <View className="h-[1px] bg-slate-200/50 mx-6" />
            <SettingsParams icon="lock" label="Đổi mật khẩu" onPress={() => { setEditMode('password'); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); setModalVisible(true); }} />
            <View className="h-[1px] bg-slate-200/50 mx-6" />
            <SettingsParams icon="log-out" label="Đăng xuất" isDestructive onPress={handleLogout} />
          </View>
        </Animated.View>

        <Text className="text-center text-slate-300 font-black text-[12px] tracking-[4px] uppercase mb-12">
          Healio Wellness • v1.0.0
        </Text>

      </ScrollView>

      {/* Edit Modal (Sync Style) */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="px-7 py-6 border-b border-slate-100 flex-row justify-between items-center">
            <Text className="font-black text-[22px] text-slate-800 tracking-tighter">{editMode === 'info' ? 'Sửa thông tin' : editMode === 'allergies' ? 'Dị ứng' : 'Đổi mật khẩu'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 w-11 h-11 rounded-full items-center justify-center"><Feather name="x" size={22} color="#475569" /></TouchableOpacity>
          </View>

          {editMode === 'info' && (
            <ScrollView className="p-7">
              <View className="bg-slate-50/80 p-6 rounded-[35px] mb-6 border border-slate-100">
                <Text className="text-[11px] text-slate-400 mb-2.5 font-black uppercase tracking-widest">Họ và tên thành viên</Text>
                <TextInput value={formData.full_name} onChangeText={t => setFormData({ ...formData, full_name: t })} className="py-2 text-[18px] border-b border-slate-200 text-slate-800 font-black tracking-tight" />

                <View className="flex-row gap-6 mt-6">
                  <View className="flex-1">
                    <Text className="text-[11px] text-slate-400 mb-2.5 font-black uppercase tracking-widest">Chiều cao (cm)</Text>
                    <TextInput value={formData.height?.toString()} keyboardType="numeric" onChangeText={t => setFormData({ ...formData, height: parseFloat(t) || 0 })} className="py-2 text-[18px] border-b border-slate-200 text-slate-800 font-black tracking-tight" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] text-slate-400 mb-2.5 font-black uppercase tracking-widest">Ngày sinh</Text>
                    <TextInput value={formData.dob} placeholder="YYYY-MM-DD" onChangeText={t => setFormData({ ...formData, dob: t })} className="py-2 text-[18px] border-b border-slate-200 text-slate-800 font-black tracking-tight" />
                  </View>
                </View>
              </View>

              <View className="bg-slate-50/80 p-6 rounded-[35px] mb-10 border border-slate-100">
                <Text className="text-[11px] text-slate-400 mb-2.5 font-black uppercase tracking-widest">Chỉ số cân nặng (kg)</Text>
                <View className="flex-row gap-6">
                  <View className="flex-1">
                    <Text className="text-[12px] text-slate-500 mt-2 font-black tracking-tighter uppercase">Thực tế</Text>
                    <TextInput value={formData.current_weight?.toString()} keyboardType="numeric" onChangeText={t => setFormData({ ...formData, current_weight: parseFloat(t) || 0 })} className="py-2 text-[18px] border-b border-slate-200 text-slate-800 font-black tracking-tight" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] text-slate-500 mt-2 font-black tracking-tighter uppercase">Mục tiêu</Text>
                    <TextInput value={formData.goal_weight?.toString()} keyboardType="numeric" onChangeText={t => setFormData({ ...formData, goal_weight: parseFloat(t) || 0 })} className="py-2 text-[18px] border-b border-slate-200 text-slate-800 font-black tracking-tight" />
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={() => handleSave(async () => await userService.updateProfile(formData))} className="bg-teal-600 py-5 rounded-[25px] items-center shadow-2xl shadow-teal-600/40">
                {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-[900] text-[18px] tracking-tight">Cập nhật hồ sơ</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}

          {editMode === 'allergies' && (
            <View className="flex-1">
              <View className="px-7 py-5 z-20">
                <View className="bg-slate-50 border border-slate-200 p-5 rounded-[22px] flex-row items-center">
                  <Feather name="search" size={20} color="#10B981" className="mr-3" />
                  <TextInput className="flex-1 text-[17px] font-black tracking-tight text-slate-800" placeholder="Tìm kiếm món dị ứng..." value={searchQuery} onChangeText={setSearchQuery} />
                </View>
                {searchResults.length > 0 && (
                  <Animated.View entering={FadeInDown} className="absolute top-[90px] left-7 right-7 bg-white rounded-[30px] shadow-2xl border border-slate-100 z-50 max-h-72 overflow-hidden" style={{ elevation: 30 }}>
                    {searchResults.map((item: any) => (
                      <TouchableOpacity key={item.id} onPress={() => { setSelectedAllergies([...selectedAllergies, item.name]); setSearchQuery(''); setSearchResults([]); }} className="p-5 border-b border-slate-50 last:border-0 flex-row items-center">
                        <View className="w-10 h-10 rounded-[15px] bg-emerald-50 items-center justify-center mr-4">
                          <MaterialCommunityIcons name="food-apple-outline" size={20} color="#10B981" />
                        </View>
                        <Text className="font-black text-[16px] text-slate-800 tracking-tight">{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
              <ScrollView className="flex-1 px-7 pt-4">
                <Text className="text-[12px] text-slate-400 font-black uppercase tracking-[2px] mb-6">Món dị ứng của bạn ({selectedAllergies.length})</Text>
                <View className="flex-row flex-wrap gap-4">
                  {selectedAllergies.map((a, i) => (
                    <TouchableOpacity key={i} onPress={() => setSelectedAllergies(selectedAllergies.filter(x => x !== a))} className="bg-white flex-row items-center px-5 py-3 rounded-[20px] border border-red-100 shadow-sm shadow-red-200/50">
                      <Text className="text-red-500 font-black text-[14px] mr-3 tracking-tight">{a}</Text>
                      <View className="bg-red-50 p-1 rounded-full"><Feather name="x" size={14} color="#EF4444" /></View>
                    </TouchableOpacity>
                  ))}
                  {selectedAllergies.length === 0 && (
                    <View className="items-center justify-center w-full py-20">
                      <MaterialCommunityIcons name="shield-check-outline" size={60} color="#E2E8F0" />
                      <Text className="text-slate-300 font-black tracking-tight mt-4 text-[16px]">Không có dữ liệu dị ứng</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
              <View className="p-7 bg-white border-t border-slate-50">
                <TouchableOpacity onPress={() => handleSave(async () => await userService.updateProfile({ allergies: selectedAllergies }))} className="bg-teal-600 py-5 rounded-[25px] items-center shadow-2xl shadow-teal-600/40">
                  <Text className="text-white font-[900] text-[18px] tracking-tight">Lưu danh sách loại trừ</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
