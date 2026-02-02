const User = require('../models/User');
const RawFood = require('../models/RawFood');
const Food = require('../models/Food');
const UserDailyLog = require('../models/UserDailyLog');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// PB_40: Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        // Date ranges for trend calculation (last 7 days vs previous 7 days)
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // 1. Users
        const usersTotal = await User.count({ where: { role: 'user' } });
        const usersLast7Days = await User.count({
            where: {
                role: 'user',
                created_at: { [Op.between]: [sevenDaysAgo, now] }
            }
        });
        const usersPrev7Days = await User.count({
            where: {
                role: 'user',
                created_at: { [Op.between]: [fourteenDaysAgo, sevenDaysAgo] }
            }
        });

        let userGrowth = 0;
        if (usersPrev7Days > 0) {
            userGrowth = ((usersLast7Days - usersPrev7Days) / usersPrev7Days) * 100;
        } else if (usersLast7Days > 0) {
            userGrowth = 100; // From 0 to something is 100% growth (symbolic)
        }

        // 2. Admins
        const adminsCount = await User.count({ where: { role: 'admin' } });

        // 3. Raw Foods (Ingredients)
        const ingredientsCount = await RawFood.count();

        // 4. Foods (Meals)
        const foodsTotal = await Food.count({ where: { status: { [Op.ne]: 'deleted' } } });
        const foodsLast7Days = await Food.count({
            where: {
                status: { [Op.ne]: 'deleted' },
                created_at: { [Op.between]: [sevenDaysAgo, now] }
            }
        });
        const foodsPrev7Days = await Food.count({
            where: {
                status: { [Op.ne]: 'deleted' },
                created_at: { [Op.between]: [fourteenDaysAgo, sevenDaysAgo] }
            }
        });

        let foodGrowth = 0;
        if (foodsPrev7Days > 0) {
            foodGrowth = ((foodsLast7Days - foodsPrev7Days) / foodsPrev7Days) * 100;
        } else if (foodsLast7Days > 0) {
            foodGrowth = 100;
        }

        // Daily Logs (Calories Tracked Today)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const logsToday = await UserDailyLog.sum('calories', {
            where: {
                date: { [Op.gte]: startOfToday.toISOString().split('T')[0] } // Approximate using date field
            }
        });

        res.json({
            users: usersTotal,
            usersGrowth: Math.round(userGrowth),
            admins: adminsCount,
            ingredients: ingredientsCount,
            foods: foodsTotal,
            foodsGrowth: Math.round(foodGrowth),
            caloriesToday: Math.round(logsToday || 0)
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
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            order: [[sequelize.col('created_at'), 'DESC']],
            limit: 5,
            attributes: [
                'id',
                'full_name',
                'avatar',
                [sequelize.col('created_at'), 'created_at']
            ]
        });

        recentUsers.forEach(user => {
            const createdAt = user.created_at;
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
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            order: [[sequelize.col('created_at'), 'DESC']],
            limit: 5,
            attributes: [
                'id',
                'name',
                'created_by_user_id',
                [sequelize.col('created_at'), 'created_at']
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

            const mealCreatedAt = meal.created_at;
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
                attributes: ['id', 'name', 'image', 'calories']
            }],
            group: ['food_id', 'food.id', 'food.name', 'food.image', 'food.calories'], // Group by included columns too
            order: [[sequelize.literal('count'), 'DESC']],
            limit: limit
        });

        // Format result
        const result = logs.map(log => ({
            id: log.food ? log.food.id : null,
            name: log.food ? log.food.name : 'Unknown',
            image: log.food ? log.food.image : null,
            calories: log.food ? parseFloat(log.food.calories) : 0,
            count: parseInt(log.get('count'))
        }));

        res.json(result);
    } catch (err) {
        console.error('Error fetching top foods:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê món ăn phổ biến' });
    }
};

// PB_44: Get User Activity Stats (Logs per day for last 7 days)
exports.getUserActivityStats = async (req, res) => {
    try {
        const days = 7;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);

        const startDateStr = startDate.toISOString().split('T')[0];

        // Query counts grouped by date
        const logs = await UserDailyLog.findAll({
            attributes: [
                'date',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                date: { [Op.gte]: startDateStr }
            },
            group: ['date'],
            order: [['date', 'ASC']]
        });

        // Create a map of existing data for quick lookup
        const logMap = {};
        logs.forEach(log => {
            logMap[log.date] = parseInt(log.get('count'));
        });

        // Fill in missing days and format for chart
        const result = [];
        const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = daysOfWeek[d.getDay()];

            result.push({
                name: dayName,
                logs: logMap[dateStr] || 0
            });
        }

        res.json(result);
    } catch (err) {
        console.error('Error fetching user activity stats:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê hoạt động người dùng' });
    }
};

// PB_45: Get Macro Stats (Average nutrition distribution)
exports.getMacroStats = async (req, res) => {
    try {
        // Calculate average macros for all active foods
        const stats = await Food.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('protein')), 'avgProtein'],
                [sequelize.fn('AVG', sequelize.col('carb')), 'avgCarb'],
                [sequelize.fn('AVG', sequelize.col('fat')), 'avgFat']
            ],
            where: {
                status: { [Op.ne]: 'deleted' }
            }
        });

        const protein = parseFloat(stats.get('avgProtein')) || 0;
        const carbs = parseFloat(stats.get('avgCarb')) || 0;
        const fat = parseFloat(stats.get('avgFat')) || 0;

        // Return formatted for PieChart
        const result = [
            { name: 'Protein', value: Math.round(protein), color: '#10B981' }, // Emerald
            { name: 'Carbs', value: Math.round(carbs), color: '#3B82F6' },   // Blue
            { name: 'Fat', value: Math.round(fat), color: '#F59E0B' }        // Amber
        ];

        res.json(result);
    } catch (err) {
        console.error('Error fetching macro stats:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê dinh dưỡng' });
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
