import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PencilSquareIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  ScaleIcon,
  NoSymbolIcon, // For allergies/restrictions
  EnvelopeIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon, // For support
  UserIcon,
  HomeIcon, // Sedentary
  PlayIcon, // Active
} from "react-native-heroicons/solid";
import * as ImagePicker from 'expo-image-picker';
import {
  TvIcon, // Sedentary alternative?
} from "react-native-heroicons/outline";

import { userService, UserProfileUpdate } from '../../services/userService';
import { Colors } from '../../constants/Colors';

// --- CONSTANTS ---

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Ít vận động', sub: 'Văn phòng, ít tập thể dục', icon: TvIcon }, // Using TV icon for sedentary as sofa metaphor
  { id: 'light', label: 'Nhẹ nhàng', sub: '1-3 ngày tập luyện / tuần', icon: UserIcon }, // Walking/Standing
  { id: 'moderate', label: 'Vừa phải', sub: '3-5 ngày tập luyện / tuần', icon: PlayIcon }, // Jogging
  { id: 'active', label: 'Năng động', sub: '6-7 ngày tập luyện / tuần', icon: BoltIcon }, // Gym/Running
  { id: 'very_active', label: 'Rất năng động', sub: 'Vận động cường độ cao', icon: FireIcon }, // Athlete
];

// Fallback Diet Modes until API connects, or mapping API codes to UI info
const DIET_MODES_UI: Record<string, { name: string, icon: any, color: string, colorBg: string }> = {
  'weight_loss': { name: 'Giảm cân', icon: ScaleIcon, color: '#10B981', colorBg: 'bg-emerald-50' }, // Green
  'balanced': { name: 'Cân bằng', icon: SparklesIcon, color: '#3B82F6', colorBg: 'bg-blue-50' },   // Blue
  'muscle_gain': { name: 'Tăng cơ', icon: BoltIcon, color: '#F59E0B', colorBg: 'bg-amber-50' },    // Orange/Yellow
  'keto': { name: 'Keto', icon: FireIcon, color: '#EF4444', colorBg: 'bg-red-50' },             // Red
  'low_carb': { name: 'Low Carb', icon: NoSymbolIcon, color: '#8B5CF6', colorBg: 'bg-violet-50' }, // Purple
};

// --- HELPER FUNCTIONS ---

const getBMI = (height: number, weight: number) => {
  if (!height || !weight) return { value: 0, label: '—', color: 'text-gray-400', bg: 'bg-gray-100' };
  const h = height / 100;
  const bmi = parseFloat((weight / (h * h)).toFixed(1));

  if (bmi < 18.5) return { value: bmi, label: 'Thiếu cân', color: 'text-blue-500', bg: 'bg-blue-100' };
  if (bmi < 23) return { value: bmi, label: 'Bình thường', color: 'text-green-500', bg: 'bg-green-100' };
  if (bmi < 25) return { value: bmi, label: 'Thừa cân', color: 'text-orange-500', bg: 'bg-orange-100' };
  return { value: bmi, label: 'Béo phì', color: 'text-red-500', bg: 'bg-red-100' };
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Can add pull-to-refresh later

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState<'info' | 'allergies' | null>(null);
  const [formData, setFormData] = useState<UserProfileUpdate>({});
  const [saving, setSaving] = useState(false);

  // Diet Presets from API
  const [dietPresets, setDietPresets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, dietData] = await Promise.all([
        userService.getProfile(),
        userService.getDietPresets()
      ]);
      setProfile(profileData);
      setDietPresets(dietData);
    } catch (error) {
      console.error('Load profile error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userInfo');
          router.replace('/auth/sign-in');
        }
      }
    ]);
  };

  // --- UPDATES ---

  const updateDietMode = async (dietCode: string) => {
    try {
      Alert.alert('Thông báo', `Đang chuyển sang chế độ: ${dietCode}. (API integration pending)`);
      // await userService.updateDiet(dietCode); 
      // loadData();
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể đổi chế độ ăn');
    }
  };

  const updateActivityLevel = async (level: string) => {
    if (!profile) return;
    try {
      // Optimistic update for UI feel?
      const oldLevel = profile.UserProfile.activity_level;
      const newProfile = { ...profile, UserProfile: { ...profile.UserProfile, activity_level: level } };
      setProfile(newProfile);

      await userService.updateProfile({ activity_level: level });
      // Should fetch again to get recalculated TDEE from backend (PB_33 AC2)
      const updated = await userService.getProfile();
      setProfile(updated);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Cập nhật thất bại');
      loadData(); // Revert
    }
  };

  const openEditInfo = () => {
    if (!profile) return;
    const p = profile.UserProfile || {};
    const n = profile.UserNutritionTarget || {};
    setFormData({
      full_name: profile.full_name,
      dob: p.dob,
      height: p.height,
      current_weight: p.current_weight,
      goal_weight: p.goal_weight, // Using goal_weight from profile
      gender: p.gender,
    });
    setEditMode('info');
    setModalVisible(true);
  };

  const saveInfo = async () => {
    try {
      setSaving(true);
      await userService.updateProfile(formData);
      await loadData();
      setModalVisible(false);
      setEditMode(null);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    } catch (e) {
      Alert.alert('Lỗi', 'Không lưu được thay đổi');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarEdit = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Chúng tôi cần quyền truy cập thư viện ảnh để thay đổi avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const uri = asset.uri;

        // Prepare form data
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore: FormData expects Blob/File on web but specific object on RN
        formData.append('avatar', { uri, name: filename, type });

        setLoading(true);
        await userService.uploadAvatar(formData);
        await loadData(); // Reload profile to see new avatar
        Alert.alert('Thành công', 'Avatar đã được cập nhật');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Lỗi', 'Không thể Cập nhật avatar. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderDietCard = (preset: any) => {
    // Map preset code to UI config
    const uiConfig = DIET_MODES_UI[preset.code.toLowerCase()] || DIET_MODES_UI['balanced'];
    const isActive = profile?.UserNutritionTarget?.DietPreset?.code === preset.code;

    return (
      <TouchableOpacity
        key={preset.code}
        onPress={() => updateDietMode(preset.code)}
        className={`w-28 p-3 mr-3 rounded-2xl border ${isActive ? 'bg-white border-yellow-400' : 'bg-white border-gray-100'}`}
        style={isActive ? { shadowColor: '#FBBF24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 } : {}}
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${uiConfig.colorBg}`}>
          <uiConfig.icon size={20} color={uiConfig.color} />
        </View>
        {isActive && (
          <View className="absolute top-2 right-2 bg-yellow-400 w-4 h-4 rounded-full items-center justify-center">
            <Text className="text-white text-[10px] font-bold">✓</Text>
          </View>
        )}
        <Text className="font-bold text-gray-800 text-sm mb-1">{preset.name}</Text>
        <Text className="text-xs text-gray-500">
          {preset.carb_ratio}/{preset.protein_ratio}/{preset.fat_ratio}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderActivityItem = (level: typeof ACTIVITY_LEVELS[0]) => {
    const isActive = profile?.UserProfile?.activity_level === level.id;

    return (
      <TouchableOpacity
        key={level.id}
        onPress={() => updateActivityLevel(level.id)}
        className={`flex-row items-center p-4 mb-3 rounded-2xl border ${isActive ? 'bg-orange-50 border-orange-400' : 'bg-white border-gray-100'
          }`}
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center ${isActive ? 'bg-orange-200' : 'bg-gray-100'}`}>
          <level.icon size={20} color={isActive ? '#F97316' : '#9CA3AF'} />
        </View>
        <View className="ml-3 flex-1">
          <Text className={`font-bold text-base ${isActive ? 'text-orange-600' : 'text-gray-700'}`}>
            {level.label}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {level.sub}
          </Text>
        </View>
        <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${isActive ? 'border-orange-500' : 'border-gray-300'
          }`}>
          {isActive && <View className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
        </View>
      </TouchableOpacity>
    );
  };

  const MenuItem = ({ icon: Icon, title, sub, onPress, isDestructive = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 border-b border-gray-50 bg-white first:rounded-t-xl last:rounded-b-xl last:border-0"
    >
      <View className="flex-row items-center">
        <Icon size={22} color={isDestructive ? '#EF4444' : '#6B7280'} />
        <View className="ml-3">
          <Text className={`font-medium text-base ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>
            {title}
          </Text>
          {sub && <Text className="text-xs text-gray-400 mt-0.5">{sub}</Text>}
        </View>
      </View>
      <ChevronRightIcon size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) return null;

  const p = profile.UserProfile || {};
  const n = profile.UserNutritionTarget || {};
  const bmi = getBMI(p.height, p.current_weight);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-3 flex-row items-center justify-between bg-white z-10 sticky top-0">
        <TouchableOpacity onPress={() => router.back()}>
          {/* Placeholder for back if needed, or empty for tab root */}
          {/* <ArrowLeftIcon size={24} color="black" /> */}
          <View className="w-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Hồ sơ & Mục tiêu</Text>
        <TouchableOpacity onPress={() => { /* Settings route? */ }}>
          <View className="w-6" />
          {/* <Cog6ToothIcon size={24} color={Colors.primary} /> */}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Avatar Section */}
        <View className="items-center mt-6 mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-gray-200">
              {profile.avatar ? (
                <Image
                  source={{ uri: profile.avatar.startsWith('http') ? profile.avatar : `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${profile.avatar}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Image source={{ uri: 'https://ui-avatars.com/api/?name=' + profile.full_name }} className="w-full h-full" />
              )}
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-yellow-400 p-1.5 rounded-full border-2 border-white"
              onPress={handleAvatarEdit}
            >
              <PencilSquareIcon size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-gray-800 mt-3">{profile.full_name}</Text>
          {/* Deleted Pro Badge as requested */}
        </View>

        {/* Stats Grid - PB_32 */}
        <View className="flex-row justify-between px-5 mb-8">
          {/* BMI */}
          <View className="bg-white p-3 rounded-2xl w-[31%] items-center shadow-sm">
            <Text className="text-xs font-semibold text-gray-400 mb-1">BMI</Text>
            <Text className={`text-xl font-bold ${bmi.color}`}>{bmi.value}</Text>
            <View className={`px-2 py-0.5 rounded-full mt-1 ${bmi.bg}`}>
              <Text className={`text-[10px] font-bold ${bmi.color}`}>{bmi.label}</Text>
            </View>
          </View>

          {/* BMR */}
          <View className="bg-white p-3 rounded-2xl w-[31%] items-center shadow-sm">
            <Text className="text-xs font-semibold text-gray-400 mb-1">BMR</Text>
            <Text className="text-xl font-bold text-gray-800">
              {Math.round(n.tdee / (p.activity_level ? 1.2 : 1)) || 0}
            </Text>
            <Text className="text-[10px] text-gray-400 mt-1">kcal/ngày</Text>
          </View>

          {/* TDEE */}
          <View className="bg-white p-3 rounded-2xl w-[31%] items-center shadow-sm border border-orange-100">
            <Text className="text-xs font-semibold text-gray-400 mb-1">TDEE</Text>
            <Text className="text-xl font-bold text-orange-500">{n.tdee || 0}</Text>
            <Text className="text-[10px] text-gray-400 mt-1">kcal/ngày</Text>
          </View>
        </View>

        {/* Diet Mode - PB_35 */}
        <View className="mb-8">
          <View className="px-5 flex-row justify-between items-end mb-3">
            <Text className="text-base font-bold text-gray-800">Chế độ ăn</Text>
            <TouchableOpacity>
              <Text className="text-xs text-green-600 font-medium">Chi tiết</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {/* Fallback mock data if API empty */}
            {dietPresets.length > 0 ? dietPresets.map(renderDietCard) : (
              Object.keys(DIET_MODES_UI).map(code => renderDietCard({ code, ...DIET_MODES_UI[code] }))
            )}
          </ScrollView>

          <View className="mx-5 mt-3 bg-green-50 p-3 rounded-xl flex-row items-start">
            <View className="mt-0.5"><QuestionMarkCircleIcon size={16} color="#15803d" /></View>
            <Text className="text-xs text-green-800 ml-2 flex-1 leading-4">
              Chế độ hiện tại sẽ ảnh hưởng trực tiếp đến thực đơn gợi ý hàng ngày của bạn.
            </Text>
          </View>
        </View>

        {/* Activity Level - PB_33 */}
        <View className="px-5 mb-8">
          <Text className="text-base font-bold text-gray-800 mb-3">Mức độ vận động</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {ACTIVITY_LEVELS.map(renderActivityItem)}
          </View>
        </View>

        {/* Additional Settings */}
        <View className="px-5 mb-10">
          <Text className="text-base font-bold text-gray-800 mb-3">Cài đặt khác</Text>
          <View className="rounded-xl overflow-hidden shadow-sm">
            <MenuItem
              icon={UserIcon}
              title="Thông tin cá nhân"
              onPress={openEditInfo}
            />
            <MenuItem
              icon={NoSymbolIcon}
              title="Dị ứng & Kiêng kỵ"
              sub={p.allergies?.length ? `${p.allergies.length} món` : 'Không có'}
              onPress={() => {
                setEditMode('allergies');
                setModalVisible(true);
              }}
            />
            <MenuItem
              icon={EnvelopeIcon}
              title="Hỗ trợ & Góp ý"
              onPress={() => Linking.openURL('mailto:support@healio.vn?subject=Góp ý ứng dụng Healio')}
            />
            <MenuItem
              icon={LockClosedIcon}
              title="Đổi mật khẩu"
              onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
            />
            <MenuItem
              icon={ArrowRightOnRectangleIcon}
              title="Đăng xuất"
              isDestructive
              onPress={handleLogout}
            />
          </View>
        </View>
      </ScrollView>

      {/* Edit Info Modal - PB_30 */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50 mt-4">
          <View className="px-5 py-4 bg-white flex-row justify-between items-center border-b border-gray-100">
            <Text className="text-lg font-bold">
              {editMode === 'info' ? 'Chỉnh sửa thông tin' : 'Kiêng kỵ & Dị ứng'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-100 p-1 rounded-full">
              <XMarkIcon size={20} color="black" />
            </TouchableOpacity>
          </View>

          {editMode === 'info' && (
            <ScrollView className="p-5">
              <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Thông tin cơ bản</Text>
              <View className="bg-white p-4 rounded-xl mb-6">
                <Text className="text-xs text-gray-400 mb-1">Họ và tên</Text>
                <TextInput
                  className="text-base font-medium text-gray-800 border-b border-gray-100 py-2"
                  value={formData.full_name}
                  onChangeText={t => setFormData({ ...formData, full_name: t })}
                />

                <View className="flex-row mt-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-xs text-gray-400 mb-1">Chiều cao (cm)</Text>
                    <TextInput
                      className="text-base font-medium text-gray-800 border-b border-gray-100 py-2"
                      value={formData.height?.toString()}
                      keyboardType="numeric"
                      onChangeText={t => setFormData({ ...formData, height: parseFloat(t) || 0 })}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-400 mb-1">Ngày sinh</Text>
                    <TextInput
                      className="text-base font-medium text-gray-800 border-b border-gray-100 py-2"
                      value={formData.dob}
                      placeholder="YYYY-MM-DD"
                      onChangeText={t => setFormData({ ...formData, dob: t })}
                    />
                  </View>
                </View>
              </View>

              <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">Cân nặng</Text>
              <View className="bg-white p-4 rounded-xl mb-6">
                <View className="flex-row">
                  <View className="flex-1 mr-4">
                    <Text className="text-xs text-gray-400 mb-1">Hiện tại (kg)</Text>
                    <TextInput
                      className="text-base font-medium text-gray-800 border-b border-gray-100 py-2"
                      value={formData.current_weight?.toString()}
                      keyboardType="numeric"
                      onChangeText={t => setFormData({ ...formData, current_weight: parseFloat(t) || 0 })}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-400 mb-1">Mục tiêu (kg)</Text>
                    <TextInput
                      className="text-base font-medium text-gray-800 border-b border-gray-100 py-2"
                      value={formData.goal_weight?.toString()}
                      keyboardType="numeric"
                      onChangeText={t => setFormData({ ...formData, goal_weight: parseFloat(t) || 0 })}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="bg-orange-500 py-4 rounded-xl items-center shadow-md shadow-orange-200"
                onPress={saveInfo}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="white" /> : (
                  <Text className="text-white font-bold text-base">Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}

          {editMode === 'allergies' && (
            <View className="p-5 flex-1 items-center justify-center">
              <Text className="text-gray-500">Tính năng chọn Dị ứng đang được phát triển...</Text>
              {/* Placeholder for tag selection */}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
