const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');
const UserWeightLog = require('../models/UserWeightLog');
const UserDailyLog = require('../models/UserDailyLog');
const UserFavoriteFood = require('../models/UserFavoriteFood');
const Food = require('../models/Food');
const OTP = require('../models/Otp');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { sendEmail } = require('../utils/emailService');

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
            attributes: ['id', 'email', 'full_name', 'role', 'status', 'auth_provider', 'avatar', 'created_at'],
            include: [
                {
                    model: UserProfile,
                    required: false,
                    attributes: ['goal_type', 'activity_level']
                },
                {
                    model: UserNutritionTarget,
                    required: false,
                    include: [
                        {
                            model: DietPreset,
                            required: false,
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: orderClause,
            limit,
            offset
        });

        // Map rows to include goal_type, activity_level, and diet_mode
        const mappedRows = rows.map(user => {
            const userData = user.toJSON();
            return {
                ...userData,
                goal_type: user.UserProfile?.goal_type || null,
                activity_level: user.UserProfile?.activity_level || null,
                diet_mode: user.UserNutritionTarget?.DietPreset?.name || null
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

// PB_NEW: Create User (Admin only)
exports.create = async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // Validation
        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        // Check if email exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            email,
            password_hash,
            full_name,
            role,
            status: 'active',
            auth_provider: 'local'
        });

        // Create empty profile if user
        if (role === 'user') {
            await UserProfile.create({ user_id: newUser.id });
            await UserNutritionTarget.create({ user_id: newUser.id });
        }

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            data: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role,
                status: newUser.status,
                created_at: newUser.created_at
            }
        });

    } catch (err) {
        console.error('Admin create user error:', err);
        res.status(500).json({ message: 'Lỗi khi tạo tài khoản' });
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

// PB_NEW: Delete User
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // Prevent self-deletion
        if (req.user && req.user.id === id) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản hiện tại của bạn' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }

        // Optional: Prevent deleting other admins if needed, but usually admin can delete admin
        // if (user.role === 'admin') ...

        // Hard delete (cascade should handle related data if configured in associations)
        // If not, we might need to delete related data manually first
        // Assuming models are set up with ON DELETE CASCADE
        await user.destroy();

        res.json({ success: true, message: 'Đã xóa tài khoản thành công' });

    } catch (err) {
        console.error('Admin delete user error:', err);
        res.status(500).json({ message: 'Lỗi khi xóa tài khoản' });
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

// PB_62: Reset Password (Admin)
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8); // 8 character random string
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(tempPassword, salt);

        await user.update({ password_hash });

        // Send password to user by email
        const subject = 'Healio - Mật khẩu đã được đặt lại';
        const text = `Xin chào ${user.full_name || user.email},\n\nQuản trị viên đã đặt lại mật khẩu tài khoản của bạn.\nMật khẩu mới: ${tempPassword}\n\nVui lòng đăng nhập và đổi mật khẩu để bảo mật tài khoản.\n\n— Healio`;
        await sendEmail(user.email, subject, text);

        res.json({
            message: 'Mật khẩu đã được đặt lại thành công và đã gửi email cho user',
            new_password: tempPassword
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PB_63: Change Role (Admin)
exports.changeRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent self-demotion if implemented (optional check)
        // if (req.user.id === user.id && role !== 'admin') ...

        await user.update({ role });

        res.json({ message: 'Cập nhật vai trò thành công', role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PB_61: User Statistics
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.count();

        // New users in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersWeek = await User.count({
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        // Status counts
        const activeUsers = await User.count({ where: { status: 'active' } });
        const bannedUsers = await User.count({ where: { status: 'banned' } });
        const pendingUsers = await User.count({ where: { status: 'pending' } });

        // Role counts
        const adminCount = await User.count({ where: { role: 'admin' } });
        const userCount = await User.count({ where: { role: 'user' } });

        res.json({
            total: totalUsers,
            new_this_week: newUsersWeek,
            status: {
                active: activeUsers,
                banned: bannedUsers,
                pending: pendingUsers
            },
            roles: {
                admin: adminCount,
                user: userCount
            }
        });
    } catch (err) {
        console.error('Admin user stats error:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê người dùng' });
    }
};


// PB_62: Comprehensive User Detail (V3)
exports.getComprehensiveUserDetail = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // 1. Fetch Basic User Info + Profile + Nutrition
        const user = await User.findByPk(id, {
            attributes: ['id', 'email', 'full_name', 'role', 'status', 'auth_provider', 'avatar', 'created_at', 'updated_at'],
            include: [
                { model: UserProfile, required: false },
                { model: UserNutritionTarget, required: false, include: [{ model: DietPreset, required: false }] }
            ]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Fetch OTP Info (System Metadata)
        const otps = await OTP.findAll({
            where: { email: user.email },
            order: [['created_at', 'DESC']],
            limit: 50 // Get recent ones
        });
        const otp_reset_count = await OTP.count({ where: { email: user.email, type: 'reset_password' } });
        const latest_otp = otps.length > 0 ? otps[0] : null;

        // 3. Weight Analysis
        const weightLogs = await UserWeightLog.findAll({
            where: { user_id: id },
            order: [['date', 'ASC']]
        });

        const profile = user.UserProfile;
        let startWeight = profile ? profile.start_weight : (weightLogs.length > 0 ? weightLogs[0].weight : 0);
        // If start_weight in profile is null or 0, try to take first log
        if (!startWeight && weightLogs.length > 0) startWeight = weightLogs[0].weight;

        const currentWeight = profile ? profile.current_weight : (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0);

        // Weight trend calculation
        let weightTrend = 'stable';
        if (weightLogs.length >= 2) {
            const last = weightLogs[weightLogs.length - 1].weight;
            const prev = weightLogs[weightLogs.length - 2].weight;
            if (last > prev) weightTrend = 'increasing';
            else if (last < prev) weightTrend = 'decreasing';
        }

        // 4. Eating Behavior & Compliance
        // Get logs for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentLogs = await UserDailyLog.findAll({
            where: {
                user_id: id,
                date: { [Op.gte]: thirtyDaysAgo }
            },
            include: [{ model: Food, as: 'food', attributes: ['id', 'name', 'image', 'calories', 'carb', 'protein', 'fat'] }],
            order: [['createdAt', 'DESC']]
        });

        // Calculate Meal Breakdown & Eating Habits
        const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
        const mealCalories = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
        let totalCaloriesLogged = 0;
        let totalProteinLogged = 0;
        const dailyStats = {}; // { '2023-10-27': { calories: 2000, protein: 150 } }

        // 4. Eating Behavior Stats
        const uniqueDays = new Set();
        let totalCalories = 0;
        let totalProtein = 0;

        recentLogs.forEach(log => {
            // Meal Counts
            if (mealCounts[log.meal_type] !== undefined) {
                mealCounts[log.meal_type]++;
            }

            // Stats
            totalCalories += (log.calories || 0);
            totalProtein += (log.protein || 0);

            // Unique Days
            const dateVal = log.date || log.createdAt; // Use date field, fallback to createdAt
            if (dateVal) {
                // log.date is usually string YYYY-MM-DD for DATEONLY, but safeguard it
                const dateKey = new Date(dateVal).toISOString().split('T')[0];
                uniqueDays.add(dateKey);
            }
        });

        const totalDaysLogged = uniqueDays.size;
        const avgCalories = totalDaysLogged > 0 ? Math.round(totalCalories / totalDaysLogged) : 0;
        const avgProtein = totalDaysLogged > 0 ? Math.round(totalProtein / totalDaysLogged) : 0;

        // Calculate Meal Percentages
        const totalMeals = recentLogs.length;
        const mealPercentages = {
            breakfast: totalMeals > 0 ? Math.round((mealCounts.breakfast / totalMeals) * 100) : 0,
            lunch: totalMeals > 0 ? Math.round((mealCounts.lunch / totalMeals) * 100) : 0,
            dinner: totalMeals > 0 ? Math.round((mealCounts.dinner / totalMeals) * 100) : 0,
            snack: totalMeals > 0 ? Math.round((mealCounts.snack / totalMeals) * 100) : 0
        };


        // 5. Favorites
        const favorites = await UserFavoriteFood.findAll({
            where: { user_id: id },
            include: [{ model: Food, attributes: ['id', 'name', 'image', 'calories'] }]
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                status: user.status,
                auth_provider: user.auth_provider,
                avatar: user.avatar,
                created_at: user.created_at,
                updated_at: user.updated_at,
                profile: user.UserProfile ? user.UserProfile.toJSON() : null,
                nutrition: user.UserNutritionTarget ? {
                    tdee: user.UserNutritionTarget.tdee,
                    target_calories: user.UserNutritionTarget.target_calories,
                    diet_preset: user.UserNutritionTarget.DietPreset ? user.UserNutritionTarget.DietPreset.toJSON() : null
                } : null,
                allergies: user.UserProfile && user.UserProfile.allergies ? user.UserProfile.allergies : []
            },
            otp_info: {
                latest: latest_otp ? {
                    created_at: latest_otp.created_at,
                    is_used: latest_otp.is_used,
                    type: latest_otp.type
                } : null,
                reset_count: otp_reset_count
            },
            weight_analysis: {
                history: weightLogs.map(w => ({ date: w.date, weight: w.weight })),
                start: startWeight,
                current: currentWeight,
                change: parseFloat(((currentWeight || 0) - (startWeight || 0)).toFixed(1)),
                trend: weightTrend
            },
            eating_behavior: {
                total_days_logged: totalDaysLogged,
                avg_calories: avgCalories,
                avg_protein: avgProtein,
                meal_breakdown: mealCounts,
                meal_percentages: mealPercentages
            },
            top_foods: favorites.map(f => ({
                id: f.Food.id,
                name: f.Food.name,
                image: f.Food.image,
                calories: f.Food.calories,
                logs_count: 0
            })),
            daily_diary: Object.values(recentLogs.reduce((acc, log) => {
                const dateKey = log.date || (log.createdAt ? new Date(log.createdAt).toISOString().split('T')[0] : 'Unknown');
                if (!acc[dateKey]) {
                    acc[dateKey] = {
                        date: dateKey,
                        total_calories: 0,
                        meals: {
                            breakfast: { calories: 0, items: [] },
                            lunch: { calories: 0, items: [] },
                            dinner: { calories: 0, items: [] },
                            snack: { calories: 0, items: [] }
                        }
                    };
                }

                // Add to total
                const cals = log.calories || 0;
                acc[dateKey].total_calories += cals;

                // Add to meal
                if (acc[dateKey].meals[log.meal_type]) {
                    acc[dateKey].meals[log.meal_type].calories += cals;
                    acc[dateKey].meals[log.meal_type].items.push({
                        id: log.id,
                        name: log.food.name,
                        image: log.food.image,
                        calories: cals,
                        amount: log.amount,
                        unit: log.food.unit || 'suất'
                    });
                }
                return acc;
            }, {})).sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by newest date
        });

    } catch (err) {
        console.error('Admin get comprehensive detail ERROR:', err);
        res.status(500).json({ message: 'Lỗi lấy thông tin chi tiết', error: err.message });
    }
};
