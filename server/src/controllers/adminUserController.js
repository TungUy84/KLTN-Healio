const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const SORT_FIELDS = ['id', 'email', 'full_name', 'role', 'status', 'created_at'];

// PB_57: List all accounts (User & Admin)
exports.list = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const offset = (page - 1) * limit;
        const search = (req.query.search || '').trim();
        const roleFilter = req.query.role; // 'user' | 'admin' | undefined (all)
        const statusFilter = req.query.status; // 'active' | 'banned' | 'pending' | undefined
        const sortParam = SORT_FIELDS.includes(req.query.sort) ? req.query.sort : 'created_at';
        const order = (req.query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const where = {};
        if (roleFilter === 'user' || roleFilter === 'admin') where.role = roleFilter;
        if (statusFilter === 'active' || statusFilter === 'banned' || statusFilter === 'pending') where.status = statusFilter;
        if (search) {
            where[Op.or] = [
                { email: { [Op.iLike]: `%${search}%` } },
                { full_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Build order clause - use sequelize.literal for created_at to use actual DB column
        let orderClause;
        if (sortParam === 'created_at') {
            orderClause = [[sequelize.literal('"User"."created_at"'), order]];
        } else {
            orderClause = [[sortParam, order]];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: ['id', 'email', 'full_name', 'role', 'status', 'auth_provider', 'avatar'],
            include: [
                {
                    model: UserProfile,
                    required: false,
                    attributes: ['goal_type']
                }
            ],
            order: orderClause,
            limit,
            offset
        });

        // Map rows to include goal_type from profile
        const mappedRows = rows.map(user => {
            const userData = user.toJSON();
            return {
                ...userData,
                goal_type: user.UserProfile?.goal_type || null
            };
        });

        res.json({
            data: mappedRows,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error('Admin list users:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tài khoản' });
    }
};

// PB_58, PB_59: User detail (identify info, body metrics, diet & nutrition)
exports.getById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await User.findByPk(id, {
            attributes: [
                'id', 'email', 'full_name', 'role', 'status', 'auth_provider', 'avatar',
                [sequelize.literal('"User"."created_at"'), 'created_at']
            ],
            include: [
                { model: UserProfile, required: false },
                { model: UserNutritionTarget, required: false, include: [{ model: DietPreset, required: false }] }
            ]
        });

        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

        const profile = user.UserProfile || null;
        const nutrition = user.UserNutritionTarget || null;
        const dietPreset = nutrition?.DietPreset || null;
        const createdAt = user.get('created_at');

        res.json({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            status: user.status,
            auth_provider: user.auth_provider,
            avatar: user.avatar,
            created_at: createdAt ? new Date(createdAt).toISOString() : null,
            profile: profile ? {
                gender: profile.gender,
                dob: profile.dob,
                height: profile.height,
                current_weight: profile.current_weight,
                activity_level: profile.activity_level,
                goal_type: profile.goal_type,
                goal_weight: profile.goal_weight
            } : null,
            nutrition: nutrition ? {
                tdee: nutrition.tdee,
                target_calories: nutrition.target_calories,
                diet_preset: dietPreset ? {
                    id: dietPreset.id,
                    code: dietPreset.code,
                    name: dietPreset.name,
                    carb_ratio: dietPreset.carb_ratio,
                    protein_ratio: dietPreset.protein_ratio,
                    fat_ratio: dietPreset.fat_ratio,
                    description: dietPreset.description
                } : null
            } : null,
            allergies: profile && profile.allergies ? profile.allergies.join(', ') : null
        });
    } catch (err) {
        console.error('Admin get user:', err);
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết tài khoản' });
    }
};

// PB_60: Ban account
exports.ban = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Không được khóa tài khoản Admin' });

        await user.update({ status: 'banned' });
        res.json({ success: true, message: 'Đã khóa tài khoản', user: { id: user.id, status: user.status } });
    } catch (err) {
        console.error('Admin ban user:', err);
        res.status(500).json({ message: 'Lỗi khi khóa tài khoản' });
    }
};

// Unban account (useful for admin UI)
exports.unban = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

        await user.update({ status: 'active' });
        res.json({ success: true, message: 'Đã mở khóa tài khoản', user: { id: user.id, status: user.status } });
    } catch (err) {
        console.error('Admin unban user:', err);
        res.status(500).json({ message: 'Lỗi khi mở khóa tài khoản' });
    }
};
