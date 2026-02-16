import api from './api';

export interface DietPreset {
    id: number;
    code: string;
    name: string;
    carb_ratio: number;
    protein_ratio: number;
    fat_ratio: number;
    description: string;
}

export const dietService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: DietPreset[] }>('/diets');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: DietPreset }>(`/diets/${id}`);
        return response.data;
    },

    create: async (data: Omit<DietPreset, 'id'>) => {
        const response = await api.post<{ success: boolean; message: string; data: DietPreset }>('/diets', data);
        return response.data;
    },

    update: async (id: number, data: Partial<DietPreset>) => {
        const response = await api.put<{ success: boolean; message: string; data: DietPreset }>(`/diets/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ success: boolean; message: string }>(`/diets/${id}`);
        return response.data;
    }
};
