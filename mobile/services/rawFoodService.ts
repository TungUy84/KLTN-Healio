import api from './api';

export const rawFoodService = {
    search: async (query: string) => {
        const response = await api.get('/raw-foods', {
            params: {
                search: query,
                limit: 10
            }
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/raw-foods/${id}`);
        return response.data;
    }
};
