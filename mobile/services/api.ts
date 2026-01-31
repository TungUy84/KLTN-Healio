import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Sử dụng biến môi trường hoặc fallback
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  async (config) => {
    // Sửa lại key thành 'userToken' cho khớp với authService
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401/403 (Auto Logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log(`[API] Error ${error.response.status}. Logging out...`);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');

      // Thử điều hướng ngay tại đây (Dùng router của expo-router)
      try {
        router.replace('/auth/sign-in');
      } catch (e) {
        console.log('Navigation failed from interceptor', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;