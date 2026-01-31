const User = require('../models/User');
const RawFood = require('../models/RawFood');
const Food = require('../models/Food');
const UserDailyLog = require('../models/UserDailyLog');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// PB_40: Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        // Count users (excluding admins)
        const usersCount = await User.count({
            where: { role: 'user' }
        });

        // Count admins
        const adminsCount = await User.count({
            where: { role: 'admin' }
        });

        // Count raw foods (ingredients)
        const ingredientsCount = await RawFood.count();

        // Count foods (meals)
        const foodsCount = await Food.count({
            where: { status: { [Op.ne]: 'deleted' } } // Exclude deleted
        });

        res.json({
            users: usersCount,
            admins: adminsCount,
            ingredients: ingredientsCount,
            foods: foodsCount
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Lỗi khi lấy số liệu tổng quan' });
    }
};

// PB_41: Get Recent Activities
exports.getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = [];

        // 1. Recent user registrations (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.findAll({
            where: {
                role: 'user',
                [Op.and]: [
                    sequelize.where(sequelize.literal('"User"."created_at"'), Op.gte, sevenDaysAgo)
                ]
            },
            order: [[sequelize.literal('"User"."created_at"'), 'DESC']],
            limit: 5,
            attributes: [
                'id',
                'full_name',
                'avatar',
                [sequelize.literal('"User"."created_at"'), 'created_at']
            ]
        });

        recentUsers.forEach(user => {
            const createdAt = user.get('created_at');
            activities.push({
                id: `user_${user.id}`,
                user: user.full_name,
                action: 'vừa đăng ký tài khoản',
                time: getTimeAgo(createdAt),
                timestamp: new Date(createdAt).getTime(), // For sorting
                avatar: user.avatar || null
            });
        });

        // 2. Recent meals created by admins (last 7 days)
        const recentMeals = await Food.findAll({
            where: {
                [Op.and]: [
                    sequelize.where(sequelize.literal('"Food"."created_at"'), Op.gte, sevenDaysAgo)
                ]
            },
            order: [[sequelize.literal('"Food"."created_at"'), 'DESC']],
            limit: 5,
            attributes: [
                'id',
                'name',
                'created_by_user_id',
                [sequelize.literal('"Food"."created_at"'), 'created_at']
            ]
        });

        // Get creator info for meals
        for (const meal of recentMeals) {
            let creatorName = 'Admin';
            let creatorAvatar = null;

            if (meal.created_by_user_id) {
                const creator = await User.findByPk(meal.created_by_user_id, {
                    attributes: ['full_name', 'avatar']
                });
                if (creator) {
                    creatorName = creator.full_name;
                    creatorAvatar = creator.avatar;
                }
            }

            const mealCreatedAt = meal.get('created_at');
            activities.push({
                id: `meal_${meal.id}`,
                user: creatorName,
                action: `đã thêm món "${meal.name}"`,
                time: getTimeAgo(mealCreatedAt),
                timestamp: new Date(mealCreatedAt).getTime(), // For sorting
                avatar: creatorAvatar
            });
        }

        // Sort by timestamp (most recent first) and limit
        activities.sort((a, b) => b.timestamp - a.timestamp);

        // Return top N activities
        res.json(activities.slice(0, limit));
    } catch (err) {
        console.error('Error fetching recent activities:', err);
        res.status(500).json({ message: 'Lỗi khi lấy hoạt động gần nhất' });
    }
};

// PB_43: Get Top Foods (most logged in last 30 days)
exports.getTopFoods = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const days = parseInt(req.query.days) || 30;

        const date = new Date();
        date.setDate(date.getDate() - days);
        const dateStr = date.toISOString().split('T')[0];

        // PB_43: Top Foods using Sequelize
        const logs = await UserDailyLog.findAll({
            attributes: [
                'food_id',
                [sequelize.fn('COUNT', sequelize.col('UserDailyLog.id')), 'count']
            ],
            where: {
                date: { [Op.gte]: dateStr }
            },
            include: [{
                model: Food,
                as: 'food', // Alias must match association
                attributes: ['name']
            }],
            group: ['food_id', 'food.id', 'food.name'], // Group by included columns too
            order: [[sequelize.literal('count'), 'DESC']],
            limit: limit
        });

        // Format result
        const result = logs.map(log => ({
            name: log.food ? log.food.name : 'Unknown',
            count: parseInt(log.get('count'))
        }));

        res.json(result);
    } catch (err) {
        console.error('Error fetching top foods:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê món ăn phổ biến' });
    }
};

// Helper: Calculate time ago in Vietnamese
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${Math.floor(diffDays / 7)} tuần trước`;
}
