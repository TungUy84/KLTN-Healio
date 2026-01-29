import api from './api';
import { type RawFood } from './rawFoodService';

export interface Food {
    id: number;
    name: string;
    serving_unit?: string; // e.g. "tô", "dĩa"
    image: string | null;
    description?: string; // Optional, may come from cooking field
    cooking?: string; // Database field name
    meal_categories: string[]; // ['breakfast', 'lunch', 'dinner', 'snack']
    total_calories?: number; // Keep for backward compatibility
    calories?: number; // Database field name
    protein?: number;
    carb?: number;
    fat?: number;
    micronutrients?: Record<string, number>; // JSONB object for micronutrients
    status: 'active' | 'inactive';
    diet_tags: string[]; // ['keto', 'low_carb', 'high_protein', etc.]
    createdAt: string;
    updatedAt: string;
    // PB_52: Ingredients (only included when fetching by ID)
    ingredients?: Array<RawFood & {
        FoodIngredient?: {
            amount_in_grams: number;
        };
    }>;
}

export interface FoodListResponse {
    data: Food[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const foodService = {
    getAll: async (
        page = 1,
        limit = 10,
        search = '',
        sort = 'created_at',
        order = 'DESC',
        filters?: {
            meal_category?: string;
            diet_tag?: string;
            calorie_min?: number;
            calorie_max?: number;
            status?: string;
        }
    ) => {
        const params: any = { page, limit, search, sort, order };
        if (filters) {
            if (filters.meal_category) params.meal_category = filters.meal_category;
            if (filters.diet_tag) params.diet_tag = filters.diet_tag;
            if (filters.calorie_min !== undefined) params.calorie_min = filters.calorie_min;
            if (filters.calorie_max !== undefined) params.calorie_max = filters.calorie_max;
            if (filters.status) params.status = filters.status;
        }
        const response = await api.get<FoodListResponse>('/foods', { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get<Food>(`/foods/${id}`);
        return response.data;
    },

    create: async (formData: FormData) => {
        const response = await api.post<Food>('/foods', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number | string, formData: FormData) => {
        const response = await api.put<Food>(`/foods/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await api.delete(`/foods/${id}`);
        return response.data;
    },

    generateRecipeByAI: async (foodName: string) => {
        const response = await api.post<{
            success: boolean;
            description: string;
            ingredients: any[];
            newIngredientsCount: number;
            serving_unit: string;
            meal_categories: string[];
            diet_tags: string[];
        }>('/ai/generate-recipe', { foodName });
        return response.data;
    }
};
