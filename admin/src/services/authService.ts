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
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await api.put('/users/change-password', data);
    return response.data;
  }
};
