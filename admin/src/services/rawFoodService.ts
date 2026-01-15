import api from './api';

export interface RawFood {
    id: number;
    code: string;
    name: string;
    image: string | null;
    description: string;
    unit: string;
    energy_kcal: number;
    protein_g: number;
    fat_g: number;
    carb_g: number;
    fiber_g: number;
    micronutrients: Record<string, string | number>;
    createdAt: string;
    updatedAt: string;
}

export interface RawFoodListResponse {
    data: RawFood[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const rawFoodService = {
    getAll: async (page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC') => {
        const response = await api.get<RawFoodListResponse>('/raw-foods', {
            params: { page, limit, search, sort, order }
        });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get<RawFood>(`/raw-foods/${id}`);
        return response.data;
    },

    create: async (formData: FormData) => {
        const response = await api.post<RawFood>('/raw-foods', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number | string, formData: FormData) => {
        const response = await api.put<RawFood>(`/raw-foods/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number | string) => {
        const response = await api.delete(`/raw-foods/${id}`);
        return response.data;
    },

    import: async (file: File, mode: 'skip' | 'overwrite') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);

        const response = await api.post('/raw-foods/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
