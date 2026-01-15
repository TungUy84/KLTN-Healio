import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login-admin', { email, password });
    if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminRole', response.data.role);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    // We can use a router hook if inside a component, or window.location for forced reload
    window.location.href = '/login';
  },

  isAuthenticated: () => {
      return !!localStorage.getItem('adminToken');
  }
};
