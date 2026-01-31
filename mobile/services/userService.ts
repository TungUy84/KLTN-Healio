import api from './api';

export interface UserProfileUpdate {
  full_name?: string;
  avatar?: string;
  dob?: string;
  gender?: 'male' | 'female';
  height?: number;
  current_weight?: number;
  activity_level?: string;
  goal_type?: string;
  goal_weight?: number;
  allergies?: string[];
  diet_preset_code?: string;
}

export interface CalculatedMetrics {
  bmr: number;
  tdee: number;
  target_calories: number;
  target_carb_g: number;
  target_protein_g: number;
  target_fat_g: number;
  bmi: number;
}

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UserProfileUpdate) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  completeOnboarding: async (data: any) => {
    const response = await api.post('/users/onboarding', data);
    return response.data;
  },

  // Avatar Upload
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // PB_28
  logWeight: async (weight: number, date?: string) => {
    const response = await api.post('/users/weight-log', { weight, date });
    return response.data;
  },

  // PB_27
  getWeightHistory: async () => {
    const response = await api.get('/users/weight-log');
    return response.data;
  },

  // PB_38
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/users/change-password', { oldPassword, newPassword });
    return response.data;
  },

  getDietPresets: async () => {
    const response = await api.get('/users/diet-presets');
    return response.data;
  },

  // Helper to calculate metrics based on Profile/Nutrition Target
  getCalculatedMetrics: async (): Promise<CalculatedMetrics> => {
    const response = await api.get('/users/profile');
    const user = response.data;
    const profile = user.UserProfile || {};
    const nutrition = user.UserNutritionTarget || {};
    const preset = nutrition.DietPreset || { carb_ratio: 50, protein_ratio: 30, fat_ratio: 20 }; // Default: Balanced

    const targetCalories = nutrition.target_calories || 2000;
    const tdee = nutrition.tdee || 2000;

    // Calculate Macros (grams)
    const target_carb_g = Math.round((targetCalories * (preset.carb_ratio / 100)) / 4);
    const target_protein_g = Math.round((targetCalories * (preset.protein_ratio / 100)) / 4);
    const target_fat_g = Math.round((targetCalories * (preset.fat_ratio / 100)) / 9);

    const bmr = nutrition.bmr || 1600;

    // Calculate BMI
    let bmi = 0;
    if (profile.current_weight && profile.height) {
      const heightM = profile.height / 100;
      bmi = parseFloat((profile.current_weight / (heightM * heightM)).toFixed(1));
    }

    return {
      bmr,
      tdee,
      bmi,
      target_calories: targetCalories,
      target_carb_g,
      target_protein_g,
      target_fat_g
    };
  },

  // PB_26: Weekly Chart Stats
  getWeeklyStats: async (): Promise<any[]> => {
    const response = await api.get('/users/stats/calories');
    return response.data;
  }
};
