import api from './api';

export const dashboardService = {
  // PB_40: Get Dashboard Stats (Admin dashboard)
  getStats: async () => {
    // Use dedicated /dashboard route instead of /stats overview
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // PB_41: Get Recent Activities
  getRecentActivities: async (limit?: number) => {
    const response = await api.get('/dashboard/activities', {
      params: { limit: limit || 10 }
    });
    return response.data;
  },

  // PB_43: Get Top Foods
  getTopFoods: async (limit?: number, days?: number) => {
    const response = await api.get('/dashboard/top-foods', {
      params: {
        limit: limit || 5,
        days: days || 30
      }
    });
    return response.data;
  },

  // PB_44: Get User Activity Stats (Chart)
  getActivityStats: async () => {
    const response = await api.get('/dashboard/activity-stats');
    return response.data;
  },

  // PB_45: Get Macro Stats (Pie Chart)
  getMacroStats: async () => {
    const response = await api.get('/dashboard/macro-stats');
    return response.data;
  }
};
