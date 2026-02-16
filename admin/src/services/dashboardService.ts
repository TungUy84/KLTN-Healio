import api from './api';

export const dashboardService = {
  // PB_40: Get Dashboard Stats
  getStats: async () => {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  // PB_41: Get Recent Activities
  getRecentActivities: async (limit?: number) => {
    const response = await api.get('/stats/activities', {
      params: { limit: limit || 10 }
    });
    return response.data;
  },

  // PB_43: Get Top Foods
  getTopFoods: async (limit?: number, days?: number) => {
    const response = await api.get('/stats/trending-foods', {
      params: {
        limit: limit || 5,
        days: days || 30
      }
    });
    return response.data;
  },

  // PB_44: Get User Activity Stats (Chart)
  getActivityStats: async () => {
    const response = await api.get('/stats/activity-stats');
    return response.data;
  },

  // PB_45: Get Macro Stats (Pie Chart)
  getMacroStats: async () => {
    const response = await api.get('/stats/macro-stats');
    return response.data;
  }
};
