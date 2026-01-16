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

  // PB_05: Logout
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
  }
};

