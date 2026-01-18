import api from './api';

export interface Ingredient {
    id: number;
    name: string;
    image: string;
    FoodIngredient?: {
        amount_in_grams: number;
    };
}

export interface Food {
    id: number;
    name: string;
    description?: string; // Optional if not used
    cooking?: string;     // Added cooking field
    image: string;
    calories: number;
    protein: number;
    carb: number;
    fat: number;
    fiber?: number; // PB_22: Micronutrients?
    micronutrients?: Record<string, number>; // JSONB field from DB
    serving_unit: string;
    status: string;
    meal_categories?: string[];
    diet_tags?: string[];
    is_favorite?: boolean;
    ingredients?: Ingredient[];
}

export interface FoodFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    meal_category?: string;
    diet_tag?: string;
    calorie_min?: number;
    calorie_max?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
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

export interface AddToDiaryRequest {
    food_id: number;
    meal_type: string;
    quantity: number;
    unit_name: string;
    date: string; // YYYY-MM-DD
}

export const foodService = {
    // PB_18, PB_21: Search & Filter Foods
    search: async (params: FoodFilterParams): Promise<FoodListResponse> => {
        const response = await api.get('/foods', { params });
        return response.data;
    },

    // PB_22: Get Food Detail
    getById: async (id: number | string): Promise<Food> => {
        const response = await api.get(`/foods/${id}`);
        return response.data;
    },

    // PB_19: Get Favorites
    getFavorites: async (): Promise<Food[]> => {
        const response = await api.get('/users/favorites');
        return response.data;
    },

    // PB_19: Toggle Favorite
    toggleFavorite: async (foodId: number | string): Promise<any> => {
        const response = await api.post('/users/favorites/toggle', { food_id: foodId });
        return response.data;
    },

    // PB_23: Add to Diary
    addToDiary: async (data: AddToDiaryRequest): Promise<any> => {
        const response = await api.post('/users/daily-log', data);
        return response.data;
    },

    // PB_12: Get Daily Log
    getDailyLog: async (date: string): Promise<any[]> => {
        const response = await api.get('/users/daily-log', { params: { date } });
        return response.data;
    },

    // PB_16: Update Daily Log
    updateDailyLog: async (id: number | string, quantity: number): Promise<any> => {
        const response = await api.put(`/users/daily-log/${id}`, { quantity });
        return response.data;
    },

    // PB_17: Delete Daily Log
    deleteDailyLog: async (id: number | string): Promise<any> => {
        const response = await api.delete(`/users/daily-log/${id}`);
        return response.data;
    }
};
