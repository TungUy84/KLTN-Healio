import api from './api';
import { calculateMetrics } from '../utils/calculations';

// --- Types ---

export interface DietPreset {
  id?: number;
  code: string;
  name: string;
  description: string;
  carbs_pct: number;
  protein_pct: number;
  fat_pct: number;
}

export interface UserNutritionTarget {
  id?: number;
  tdee: number;
  target_calories: number;
  DietPreset?: DietPreset;
}

export interface UserProfile {
  gender: string;
  dob: string;
  height: number;
  current_weight: number;
  activity_level: string;
  goal_type: string;
  goal_weight: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  photo_url?: string;
  UserProfile?: UserProfile;
  UserNutritionTarget?: UserNutritionTarget;
}

export interface CalculatedMetrics {
  bmi: number;
  bmr: number;
  tdee: number;
  target_calories: number;
  target_protein_g: number;
  target_carb_g: number;
  target_fat_g: number;
  current_goal: string;
  current_activity_level: string;
}

// --- API Calls ---

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const getDietPresets = async (): Promise<DietPreset[]> => {
  const response = await api.get('/users/diet-presets');
  return response.data;
};

export const completeOnboarding = async (data: any) => {
  const response = await api.post('/users/onboarding', data);
  return response.data;
};

const getAge = (dobString: string) => {
  if (!dobString) return 25; // Default age if missing
  const today = new Date();
  const dob = new Date(dobString);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

/**
 * Calculates metrics based on user profile.
 * Returns flattened structure for Dashboard.
 */
export const getCalculatedMetrics = async (): Promise<CalculatedMetrics> => {
  try {
    const user = await getProfile();
    const profile = user.UserProfile;
    const nutrition = user.UserNutritionTarget;
    const diet = nutrition?.DietPreset;

    // Defaults
    const weight = profile?.current_weight || 70;
    const height = profile?.height || 170;
    const gender = (profile?.gender === 'female') ? 'female' : 'male';
    
    const activityMap: any = {
      'sedentary': 'sedentary',
      'light': 'light',
      'moderate': 'moderate',
      'active': 'active',
      'very_active': 'very_active'
    };
    const activity = activityMap[profile?.activity_level || 'moderate'] || 'moderate';
    
    // Goal map
    const goalMap: any = {
      'lose_weight': 'lose_weight',
      'maintain': 'maintain',
      'gain_weight': 'gain_weight'
    };
    const goal = goalMap[profile?.goal_type || 'maintain'] || 'maintain';

    const age = getAge(profile?.dob || '2000-01-01');

    // Recalculate using utility 
    const calculated = calculateMetrics(age, gender, weight, height, activity, goal);
    const targetCals = nutrition?.target_calories || calculated.targetCalories;

    // Macro splits
    const carbsPct = diet ? diet.carbs_pct : 40;
    const proteinPct = diet ? diet.protein_pct : 30;
    const fatPct = diet ? diet.fat_pct : 30;

    const targetCarbs = Math.round((targetCals * (carbsPct / 100)) / 4);
    const targetProtein = Math.round((targetCals * (proteinPct / 100)) / 4);
    const targetFat = Math.round((targetCals * (fatPct / 100)) / 9);

    return {
      bmi: calculated.bmi,
      bmr: calculated.bmr,
      tdee: calculated.tdee,
      target_calories: targetCals,
      target_protein_g: targetProtein,
      target_carb_g: targetCarbs,
      target_fat_g: targetFat,
      current_goal: goal,
      current_activity_level: activity
    };
  } catch (error) {
    console.error("Error calculating metrics", error);
    // Return safe defaults
    return {
      bmi: 0,
      bmr: 0,
      tdee: 0,
      target_calories: 2000,
      target_protein_g: 150,
      target_carb_g: 200,
      target_fat_g: 65,
      current_goal: 'maintain',
      current_activity_level: 'moderate'
    };
  }
};

export const userService = {
  getProfile,
  getDietPresets,
  completeOnboarding,
  getCalculatedMetrics
};
