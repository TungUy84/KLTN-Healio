import api from './api';

// Các kiểu trả về từ Backend
export interface DashboardStats {
    currentWeight: number;
    targetWeight: number;
    avgCaloriesWeek: number;
    targetCalories: number;
    streak: number;
    consistencyScore: number;
}

export interface NutritionStats {
    target: {
        calories: number;
        carb: number;
        protein: number;
        fat: number;
    };
    timeline: {
        date: string;
        calories: number;
        carb: number;
        protein: number;
        fat: number;
    }[];
    macroSplit: {
        carb: number;
        protein: number;
        fat: number;
    };
}

export interface BodyStats {
    history: { date: string; weight: number }[];
    currentWeight: number;
    goalWeight: number;
    height: number;
    bmi: number;
    changeRatePerWeek: number;
}

export interface FoodInsights {
    mealDistribution: { meal: string; calories: number }[];
    topFoods: {
        id: number;
        name: string;
        image: string;
        calories: number;
        timesEaten: number;
    }[];
    consistency: { date: string; calories: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const { data } = await api.get('/users/stats/dashboard');
    return data;
};

export const getNutritionStats = async (period = '7d'): Promise<NutritionStats> => {
    const { data } = await api.get(`/users/stats/nutrition?period=${period}`);
    return data;
};

export const getBodyStats = async (period = '3m'): Promise<BodyStats> => {
    const { data } = await api.get(`/users/stats/body?period=${period}`);
    return data;
};

export const getFoodInsights = async (period = '30d'): Promise<FoodInsights> => {
    const { data } = await api.get(`/users/stats/food-insights?period=${period}`);
    return data;
};
