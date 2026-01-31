import api from './api';

export interface AdminUser {
    id: number;
    email: string;
    full_name: string;
    role: 'user' | 'admin';
    status: 'active' | 'banned' | 'pending';
    auth_provider: string;
    avatar: string | null;
    created_at: string;
    goal_type: string | null; // PB_57: Mục tiêu hiện tại
}

export interface AdminUserDetail extends AdminUser {
    profile: {
        gender: string | null;
        dob: string | null;
        height: number | null;
        current_weight: number | null;
        activity_level: string | null;
        goal_type: string | null;
        goal_weight: number | null;
    } | null;
    nutrition: {
        tdee: number;
        target_calories: number;
        diet_preset: {
            id: number;
            code: string;
            name: string;
            carb_ratio: number;
            protein_ratio: number;
            fat_ratio: number;
            description: string | null;
        } | null;
    } | null;
    allergies: string | null;
}

export interface AdminUserListResponse {
    data: AdminUser[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const adminUserService = {
    list: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: 'user' | 'admin';
        status?: 'active' | 'banned' | 'pending';
        sort?: string;
        order?: 'ASC' | 'DESC';
    } = {}) => {
        const response = await api.get<AdminUserListResponse>('/admin/users', { params });
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await api.get<AdminUserDetail>(`/admin/users/${id}`);
        return response.data;
    },

    ban: async (id: number | string) => {
        const response = await api.patch(`/admin/users/${id}/ban`);
        return response.data;
    },

    unban: async (id: number | string) => {
        const response = await api.patch(`/admin/users/${id}/unban`);
        return response.data;
    },
};
