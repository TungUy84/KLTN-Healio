const { Op } = require('sequelize'); // Removed Sequelize import if not used directly, or require sequelize instance for fn/col
const sequelize = require('../config/database');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');
const Food = require('../models/Food');
const UserDailyLog = require('../models/UserDailyLog');
const XLSX = require('xlsx');

// PB_61: Thống kê Tăng trưởng User (User Growth)
exports.getUserGrowth = async (req, res) => {
    try {
        const { range } = req.query; // '7d', '30d', 'month', 'year', 'custom'
        const { startDate: customStart, endDate: customEnd } = req.query;

        let startDate = new Date();
        let endDate = new Date();
        // let groupBy = 'day'; // Logic handled in query grouping

        if (range === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
        } else if (range === '30d') {
            startDate.setDate(startDate.getDate() - 30);
        } else if (range === 'month') {
            startDate.setDate(1);
        } else if (range === 'year') {
            startDate.setMonth(0, 1);
            // groupBy = 'month'; // Complex to switch group by dynamically in ORM cross-db, stick to day for now or simple month
        } else {
            // Default 7 days
            startDate.setDate(startDate.getDate() - 7);
        }

        // Set end of day for endDate
        endDate.setHours(23, 59, 59, 999);

        // Sequelize syntax for grouping by date
        // Note: 'date' only works if column is type DATEONLY or similar. 
        // For TIMESTAMP 'created_at', we need to cast/truncate.
        // Postgres: TO_CHAR(created_at, 'YYYY-MM-DD')

        const stats = await User.findAll({
            attributes: [
                [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD'), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                role: 'user',
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD')],
            order: [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD'), 'ASC']],
            raw: true
        });

        res.json(stats);
    } catch (err) {
        console.error('Growth Stats Error:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê tăng trưởng' });
    }
};

// PB_62: Thống kê Món ăn phổ biến (Trending Foods)
exports.getTrendingFoods = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const days = parseInt(req.query.days) || 30;

        const date = new Date();
        date.setDate(date.getDate() - days);
        const dateStr = date.toISOString().split('T')[0];

        // Count logs by food_id
        // UserDailyLog.findAll with grouping and include Food
        // Note: Include with grouping usually requires all included columns in group or aggregation
        // Simplest way: Group by food_id, count, and include Food model attributes in group or fetch separately.
        // Sequelize often struggles with "include + group" unless columns are carefully managed.
        // Let's try matching grouping by Food.id

        const logs = await UserDailyLog.findAll({
            attributes: [
                'food_id',
                [sequelize.fn('COUNT', sequelize.col('UserDailyLog.id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('UserDailyLog.calories')), 'total_calories']
            ],
            where: {
                date: { [Op.gte]: dateStr }
            },
            include: [{
                model: Food,
                as: 'food',
                attributes: ['id', 'name', 'image']
            }],
            group: ['food_id', 'food.id', 'food.name', 'food.image'], // Must group by included columns too
            order: [[sequelize.literal('count'), 'DESC']],
            limit: limit
        });

        // Format result (Sequelize might return nested structure depending on raw/nest)
        // With group/include, it returns model instances with .food property
        const results = logs.map(log => ({
            id: log.food_id,
            name: log.food ? log.food.name : 'Unknown',
            image: log.food ? log.food.image : null,
            count: parseInt(log.get('count')),
            total_calories: parseInt(log.get('total_calories') || 0)
        }));

        res.json(results);
    } catch (err) {
        console.error('Trending Foods Error:', err);
        res.status(500).json({ message: 'Lỗi khi lấy Top món ăn' });
    }
};

// PB_63: Thống kê Phân bổ (Demographics)
exports.getUserDemographics = async (req, res) => {
    try {
        // Goal Distribution
        const goalStats = await UserProfile.findAll({
            attributes: [
                'goal_type',
                [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
            ],
            where: {
                goal_type: { [Op.not]: null }
            },
            group: ['goal_type'],
            raw: true
        });

        // Gender Distribution
        const genderStats = await UserProfile.findAll({
            attributes: [
                'gender',
                [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
            ],
            where: {
                gender: { [Op.not]: null }
            },
            group: ['gender'],
            raw: true
        });

        res.json({
            goals: goalStats,
            gender: genderStats
        });
    } catch (err) {
        console.error('Demographics Error:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê phân bổ' });
    }
};

// PB_64: Thống kê Chế độ dinh dưỡng (Diet Stats)
exports.getDietStats = async (req, res) => {
    try {
        // Count users per Diet Preset
        const stats = await UserNutritionTarget.findAll({
            attributes: [
                'diet_preset_id',
                [sequelize.fn('COUNT', sequelize.col('UserNutritionTarget.user_id')), 'count'] // Explicit table name alias often helps
            ],
            include: [{
                model: DietPreset,
                attributes: ['name', 'code']
            }],
            group: ['diet_preset_id', 'DietPreset.id', 'DietPreset.name', 'DietPreset.code'],
            order: [[sequelize.literal('count'), 'DESC']],
        });

        const results = stats.map(s => ({
            name: s.DietPreset ? s.DietPreset.name : 'Chưa chọn',
            code: s.DietPreset ? s.DietPreset.code : 'none',
            count: parseInt(s.get('count'))
        }));

        res.json(results);
    } catch (err) {
        console.error('Diet Stats Error:', err);
        res.status(500).json({ message: 'Lỗi khi lấy thống kê chế độ dinh dưỡng' });
    }
};

// PB_65: Xuất Báo cáo Excel
exports.exportStats = async (req, res) => {
    try {
        // Fetch User Data
        const users = await User.findAll({
            where: { role: 'user' },
            attributes: ['id', 'full_name', 'email', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        // Demographics Data (Join Profile)
        const profiles = await User.findAll({
            where: { role: 'user' },
            include: [{
                model: UserProfile,
                attributes: ['gender', 'goal_type', 'dob', 'height', 'current_weight']
            }],
            attributes: ['full_name', 'email']
        });

        // Trending Foods
        const topFoods = await UserDailyLog.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('UserDailyLog.id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('UserDailyLog.calories')), 'total_kcal']
            ],
            include: [{
                model: Food,
                as: 'food',
                attributes: ['name']
            }],
            group: ['food.id', 'food.name'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 50
        });

        // Create Excel
        const wb = XLSX.utils.book_new();

        // Sheet 1: Users
        const wsUsers = XLSX.utils.json_to_sheet(users.map(u => ({
            ID: u.id,
            Name: u.full_name,
            Email: u.email,
            Joined: u.created_at
        })));
        XLSX.utils.book_append_sheet(wb, wsUsers, "New Users");

        // Sheet 2: User Details (Demographics)
        const wsDemo = XLSX.utils.json_to_sheet(profiles.map(u => {
            const p = u.UserProfile || {};
            // Calculate Age
            let age = '';
            if (p.dob) {
                // simple age calc
                age = new Date().getFullYear() - new Date(p.dob).getFullYear();
            }
            return {
                Name: u.full_name,
                Email: u.email,
                Gender: p.gender === 'male' ? 'Nam' : (p.gender === 'female' ? 'Nữ' : ''),
                Goal: p.goal_type,
                Height: p.height,
                Weight: p.current_weight,
                Age: age
            };
        }));
        XLSX.utils.book_append_sheet(wb, wsDemo, "User Profiles");

        // Sheet 3: Top Foods
        const wsFoods = XLSX.utils.json_to_sheet(topFoods.map(item => ({
            FoodName: item.food ? item.food.name : 'Unknown',
            Count: item.get('count'),
            TotalCalories: item.get('total_kcal')
        })));
        XLSX.utils.book_append_sheet(wb, wsFoods, "Trending Foods");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="Healio_Report.xlsx"');
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).json({ message: 'Lỗi khi xuất báo cáo' });
    }
};
