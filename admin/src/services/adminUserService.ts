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
    updated_at: string;
    goal_type: string | null; // PB_57: Mục tiêu hiện tại
    activity_level: string | null;
    diet_mode: string | null;
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
        allergies: string[] | null;
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

export interface AdminUserStats {
    total: number;
    new_this_week: number;
    status: {
        active: number;
        banned: number;
        pending: number;
    };
    roles: {
        admin: number;
        user: number;
    };
}

export const adminUserService = {
    getStats: async () => {
        const response = await api.get<AdminUserStats>('/admin/users/stats');
        return response.data;
    },

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

    async resetPassword(id: number) {
        const res = await api.patch(`/admin/users/${id}/reset-password`);
        return res.data; // Expected { message, new_password }
    },

    async changeRole(id: number, role: 'user' | 'admin') {
        const res = await api.patch(`/admin/users/${id}/role`, { role });
        return res.data;
    },

    async getComprehensiveUserDetail(id: string): Promise<any> {
        const response = await api.get(`/admin/users/${id}/comprehensive`);
        return response.data;
    }
};

export interface ComprehensiveUserDetail {
    user: AdminUserDetail;
    otp_info: {
        latest: { created_at: string; is_used: boolean; type: string } | null;
        reset_count: number;
    };
    weight_analysis: {
        history: { date: string; weight: number }[];
        start: number | null;
        current: number | null;
        change: number;
        trend: 'stable' | 'increasing' | 'decreasing';
    };
    eating_behavior: {
        total_days_logged: number;
        avg_calories: number;
        avg_protein: number;
        meal_breakdown: { breakfast: number; lunch: number; dinner: number; snack: number };
        meal_percentages: { breakfast: number; lunch: number; dinner: number; snack: number };
    };
    top_foods: { id: number; name: string; image: string; calories: number; logs_count: number }[];
    favorites: { id: number; name: string; image: string; calories: number }[];
    daily_diary: DailyDiary[];
}

export interface DailyDiary {
    date: string;
    total_calories: number;
    meals: {
        breakfast: MealGroup;
        lunch: MealGroup;
        dinner: MealGroup;
        snack: MealGroup;
    };
}

export interface MealGroup {
    calories: number;
    items: LogItem[];
}

export interface LogItem {
    id: number;
    name: string;
    image: string;
    calories: number;
    amount: number;
    unit: string;
}
