import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // PB_01: Login
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // PB_02: Google Login
  loginGoogle: async (userInfo: any) => {
    // userInfo: { email, id, name, picture, ... }
    const response = await api.post('/auth/google', {
      email: userInfo.email,
      google_id: userInfo.id,
      full_name: userInfo.name,
      avatar: userInfo.picture,
    });

    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // PB_03: Register Step 1 (Get OTP)
  register: async (email: string, password: string, full_name: string) => {
    const response = await api.post('/auth/register', { email, password, full_name });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string, type: 'register' | 'forgot-password') => {
    const response = await api.post('/auth/resend-otp', { email, type });
    return response.data;
  },

  // PB_03: Register Step 2 (Verify OTP & Active)
  verifyRegisterOtp: async (email: string, otp: string) => {
    const response = await api.post('/auth/register/verify', { email, otp });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // PB_04: Forgot Password Step 1
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // PB_04: Forgot Password Step 2
  verifyResetOtp: async (email: string, otp: string) => {
    const response = await api.post('/auth/reset-password/verify', { email, otp });
    return response.data;
  },

  // PB_04: Forgot Password Step 3
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
  },

  // API Call để đánh dấu User đã hoàn thành Walkthrough
  markTutorialSeen: async () => {
    const response = await api.put('/users/tutorial-seen');
    return response.data;
  },

  // === LOCAL STORAGE WALKTHROUGHS FOR SUB-EPICS (DIARY, FOODS, A-IPLAN) ===
  checkEpicTutorial: async (epicKey: string) => {
    // Trả về true nếu ĐÃ XEM, false nếu CHƯA XEM
    try {
      const val = await AsyncStorage.getItem(`@epic_tutorial_${epicKey}`);
      return val === 'true';
    } catch { return false; }
  },
  markEpicTutorialSeen: async (epicKey: string) => {
    try {
      await AsyncStorage.setItem(`@epic_tutorial_${epicKey}`, 'true');
    } catch { }
  },
  resetAllEpicTutorials: async () => {
    try {
      await AsyncStorage.multiRemove([
        '@epic_tutorial_diary',
        '@epic_tutorial_food_detail',
        '@epic_tutorial_ai-plan',
        '@healio_tutorial_diary',
        '@healio_tutorial_food_detail',
        '@healio_tutorial_ai-plan'
      ]);
    } catch (e) { console.error('Error resetting epic tutorials:', e); }
  }
};

export default authService;
