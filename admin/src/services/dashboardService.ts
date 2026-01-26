import api from './api';

export const dashboardService = {
  // PB_40: Get Dashboard Stats
  getStats: async () => {
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

  // PB_43: Get Top Dishes
  getTopDishes: async (limit?: number, days?: number) => {
    const response = await api.get('/dashboard/top-dishes', {
      params: { 
        limit: limit || 5,
        days: days || 30
      }
    });
    return response.data;
  }
};
