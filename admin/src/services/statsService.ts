import api from './api';

export const statsService = {
    // User Growth
    getUserGrowth: async (range: string) => {
        const response = await api.get('/stats/growth', { params: { range } });
        return response.data;
    },

    // Trending Foods
    getTrendingFoods: async (range: string) => {
        const days = range === '7d' ? 7 : range === '30d' ? 30 : 30; // Default logic
        const response = await api.get('/stats/trending-foods', { params: { days } });
        return response.data;
    },

    // Demographics
    getDemographics: async () => {
        const response = await api.get('/stats/demographics');
        return response.data;
    },

    // Diet Stats
    getDietStats: async () => {
        const response = await api.get('/stats/diets');
        return response.data;
    },

    // New Charts V2
    getActivityPeak: async () => {
        const response = await api.get('/stats/activity-peak');
        return response.data;
    },
    getBMIDistribution: async () => {
        const response = await api.get('/stats/bmi-dist');
        return response.data;
    },
    getMacroRadar: async () => {
        const response = await api.get('/stats/macro-radar');
        return response.data;
    },

    // V3 Mega Dashboard
    getSystemStats: async () => {
        const response = await api.get('/stats/system');
        return response.data;
    },
    getNutritionStats: async () => {
        const response = await api.get('/stats/nutrition');
        return response.data;
    },
    getGoalStats: async () => {
        const response = await api.get('/stats/goals');
        return response.data;
    },
    getUserInsights: async () => {
        const response = await api.get('/stats/insights');
        return response.data;
    },
    getFoodStats: async () => {
        const response = await api.get('/stats/foods-stats');
        return response.data;
    },

    // Export
    exportReport: async () => {
        const response = await api.get('/stats/export', { responseType: 'blob' });
        return response.data;
    }
};
