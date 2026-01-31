import api from './api';

export interface MealPlanSuggestion {
    breakfast: { food_id: number; amount: number; reason: string; detail?: any };
    lunch: { food_id: number; amount: number; reason: string; detail?: any };
    dinner: { food_id: number; amount: number; reason: string; detail?: any };
    total_calories: number;
    note: string;
}

export const aiService = {
    suggestMealPlan: async (): Promise<MealPlanSuggestion> => {
        const response = await api.post('/ai/suggest-meal-plan');
        return response.data;
    }
};
