import api from './api';

export interface Meal {
    id: number;
    name: string;
    image: string | null;
    description: string;
    meal_categories: string[]; // ['breakfast', 'lunch', 'dinner', 'snack']
    total_calories: number;
    status: 'active' | 'inactive';
    diet_tags: string[]; // ['keto', 'low_carb', 'high_protein', etc.]
    createdAt: string;
    updatedAt: string;
}

export interface MealListResponse {
    data: Meal[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const mealService = {
    getAll: async (
        page = 1, 
        limit = 10, 
        search = '', 
        sort = 'createdAt', 
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
        const response = await api.get<MealListResponse>('/meals', { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get<Meal>(`/meals/${id}`);
        return response.data;
    },

    create: async (formData: FormData) => {
        const response = await api.post<Meal>('/meals', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number | string, formData: FormData) => {
        const response = await api.put<Meal>(`/meals/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await api.delete(`/meals/${id}`);
        return response.data;
    }
};
