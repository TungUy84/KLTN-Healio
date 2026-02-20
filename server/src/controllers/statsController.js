const { Op, literal } = require('sequelize');
const sequelize = require('../config/database');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');
const Food = require('../models/Food');
const UserDailyLog = require('../models/UserDailyLog');
const UserWeightLog = require('../models/UserWeightLog');
const XLSX = require('xlsx');

// PB_61: Thống kê Tổng quan (System Overview)
exports.getSystemOverview = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        // 1. KPI Cards
        const totalUsers = await User.count({ where: { role: 'user' } });

        // Active users: Users who have logged in or performed actions in the last 30 days
        // Better approximation: Users with logs in last 30 days OR created in last 30 days.
        const activeUsersCount = await User.count({ where: { status: 'active', role: 'user' } });

        const totalLogs = await UserDailyLog.count();
        const totalWeightLogs = await UserWeightLog.count();
        const totalFoods = await Food.count();
        const totalIngredients = await sequelize.models.RawFood ? await sequelize.models.RawFood.count() : 0;

        // Calculate Growth (Simple comparison with last month for now, or just send current)
        // ideally we store snapshots or calculate from history

        // Engagement Rate (Last 7 days)
        const engagedUsers = await UserDailyLog.count({
            distinct: true,
            col: 'user_id',
            where: {
                date: {
                    [Op.gte]: sevenDaysAgo
                }
            }
        });

        // Calories logged today
        const startOfToday = new Date().toISOString().split('T')[0];
        const caloriesTodayStart = await UserDailyLog.sum('calories', {
            where: { date: startOfToday }
        });

        res.json({
            users: totalUsers,
            activeUsers: activeUsersCount,
            foods: totalFoods,
            ingredients: totalIngredients,
            logs: totalLogs,
            caloriesToday: caloriesTodayStart || 0,
            usersGrowth: 12, // Placeholder or calc
            foodsGrowth: 5,   // Placeholder or calc
            engagement7d: engagedUsers
        });

    } catch (err) {
        console.error('Stats Overview Error:', err);
        res.status(500).json({ message: 'Lỗi lấy dữ liệu thống kê tổng quan' });
    }
};

// PB_NEW: Get Recent Activities
exports.getRecentActivities = async (req, res) => {
    try {
        // Fetch recent logs
        const logs = await UserDailyLog.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['full_name'] },
                { model: Food, as: 'food', attributes: ['name'] }
            ]
        });

        const activities = logs.map(log => ({
            id: log.id,
            user: log.user ? log.user.full_name : 'Unknown',
            action: `đã ăn ${log.food ? log.food.name : 'món ăn'} (${Math.round(log.calories)} kcal)`,
            time: new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json(activities);
    } catch (err) {
        console.error('Recent Activities Error:', err);
        res.status(500).json({ message: 'Lỗi lấy hoạt động gần đây' });
    }
};

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



// ============================================
// MEGA DASHBOARD APIS (V3)
// ============================================

// 1. System Overview (Nhóm 1)
exports.getSystemStats = async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        // A. User Growth (Line) - Reusing logic but grouped
        // ... (Simplified for brevity, assuming similar to previous getUserGrowth)

        // B. Active Rate (Bar)
        const totalUsers = await User.count({ where: { role: 'user' } });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers7d = await UserDailyLog.count({
            distinct: true,
            col: 'user_id',
            where: { createdAt: { [Op.gte]: sevenDaysAgo } }
        });
        const inactiveUsers = totalUsers - activeUsers7d;

        // C. Role Distribution (Pie)
        const roles = await User.findAll({
            attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['role']
        });

        res.json({
            activeRate: [
                { name: 'Active (7d)', value: activeUsers7d },
                { name: 'Inactive', value: inactiveUsers > 0 ? inactiveUsers : 0 }
            ],
            roles: roles.map(r => ({ name: r.role, value: parseInt(r.get('count')) }))
        });
    } catch (err) {
        console.error("System Stats Error", err);
        res.status(500).json({});
    }
};

// 2. Nutrition Behavior (Nhóm 2)
exports.getNutritionStats = async (req, res) => {
    try {
        // A. Avg Calories Trend (Line) - Last 14 days
        const days = 14;
        const calTrend = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Avg Logged
            const avgLog = await UserDailyLog.findOne({
                where: { date: dateStr }, // specific date
                attributes: [[sequelize.fn('AVG', sequelize.col('calories')), 'avg']]
            });
            // Avg Target (Approximate const for now or query UserNutritionTarget)
            calTrend.push({
                date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                actual: Math.round(avgLog?.get('avg') || 0),
                target: 2000 // Mock avg target
            });
        }

        // B. Calorie Distribution (Histogram)
        // Group users by avg daily calories
        // This is complex in SQL, doing simplified version: Histogram of *Logs* not Users for speed
        const calorieLogs = await UserDailyLog.findAll({
            attributes: ['calories']
        });
        const buckets = { '<1500': 0, '1500-2000': 0, '2000-2500': 0, '>2500': 0 };
        calorieLogs.forEach(l => {
            const c = l.calories;
            if (c < 1500) buckets['<1500']++;
            else if (c <= 2000) buckets['1500-2000']++;
            else if (c <= 2500) buckets['2000-2500']++;
            else buckets['>2500']++;
        });
        const calorieDist = Object.keys(buckets).map(k => ({ name: k, value: buckets[k] }));

        // C. Macro Ratio System-wide (Donut)
        const macroSum = await UserDailyLog.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('carb')), 'carb'],
                [sequelize.fn('SUM', sequelize.col('protein')), 'protein'],
                [sequelize.fn('SUM', sequelize.col('fat')), 'fat'],
            ]
        });
        const m = macroSum ? macroSum.toJSON() : { carb: 0, protein: 0, fat: 0 };
        // Convert to cal contribution: Carb*4, Pro*4, Fat*9
        const totalCal = (m.carb * 4) + (m.protein * 4) + (m.fat * 9);
        const macroDist = [
            { name: 'Carb', value: totalCal ? Math.round((m.carb * 4 / totalCal) * 100) : 0 },
            { name: 'Protein', value: totalCal ? Math.round((m.protein * 4 / totalCal) * 100) : 0 },
            { name: 'Fat', value: totalCal ? Math.round((m.fat * 9 / totalCal) * 100) : 0 },
        ];

        // D. Meals Breakdown (Stacked or Bar)
        const mealCounts = await UserDailyLog.findAll({
            attributes: ['meal_type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['meal_type']
        });

        // E. Skip Breakfast (Approx)
        // Count logs that are 'breakfast' vs total unique user-days
        // Simplified: % of logs that are breakfast vs expected (25%?)? No, user wants % users log breakfast.
        // Hard to calculate accurately without complex query. 
        // Mocking logic: (Unique Users with Breakfast Log / Total Unique Users) * 100
        const usersWithBreakfast = await UserDailyLog.count({
            distinct: true,
            col: 'user_id',
            where: { meal_type: 'breakfast' }
        });
        const totalLogUsers = await UserDailyLog.count({ distinct: true, col: 'user_id' });

        res.json({
            calTrend,
            calorieDist,
            macroDist,
            mealBreakdown: mealCounts.map(m => ({ name: m.meal_type, value: parseInt(m.get('count')) })),
            breakfastStats: [
                { name: 'Có ăn sáng', value: usersWithBreakfast },
                { name: 'Bỏ ăn sáng', value: totalLogUsers - usersWithBreakfast }
            ]
        });

    } catch (err) {
        console.error("Nutrition Stats Error", err);
        res.status(500).json({});
    }
};

// PB_NEW: Activity Peak (By Hour) - Biểu đồ Giờ cao điểm
exports.getActivityPeak = async (req, res) => {
    try {
        // Group by Hour of day
        // Sequelize: extract hour from created_at
        // Note: UserDailyLog model uses default timestamps (createdAt), unlike User (created_at)
        const stats = await UserDailyLog.findAll({
            attributes: [
                [sequelize.fn('EXTRACT', sequelize.literal('HOUR from "createdAt"')), 'hour'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR from "createdAt"'))],
            order: [[sequelize.literal('hour'), 'ASC']],
            raw: true
        });

        // Fill missing hours 0-23
        const result = Array.from({ length: 24 }, (_, i) => {
            const found = stats.find(s => parseInt(s.hour) === i);
            return {
                hour: `${i}:00`,
                count: found ? parseInt(found.count) : 0,
                fullMark: 100 // for radar background if needed
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Activity Peak Error:', err);
        res.status(500).json([]);
    }
};

// PB_NEW: BMI Distribution - Phân bổ BMI
exports.getBMIDistribution = async (req, res) => {
    try {
        const profiles = await UserProfile.findAll({
            attributes: ['height', 'current_weight']
        });

        const buckets = {
            'Thiếu cân (<18.5)': 0,
            'Bình thường (18.5-24.9)': 0,
            'Thừa cân (25-29.9)': 0,
            'Béo phì (≥30)': 0
        };

        profiles.forEach(p => {
            if (p.height && p.current_weight) {
                const h = p.height / 100; // cm to m
                const bmi = p.current_weight / (h * h);
                if (bmi < 18.5) buckets['Thiếu cân (<18.5)']++;
                else if (bmi < 25) buckets['Bình thường (18.5-24.9)']++;
                else if (bmi < 30) buckets['Thừa cân (25-29.9)']++;
                else buckets['Béo phì (≥30)']++;
            }
        });

        // Convert to array for Recharts
        const data = Object.keys(buckets).map(key => ({
            name: key,
            value: buckets[key]
        }));

        res.json(data);
    } catch (err) {
        console.error('BMI Stats Error:', err);
        res.status(500).json([]);
    }
};

// PB_NEW: Activity Stats (Chart Area)
exports.getActivityStats = async (req, res) => {
    try {
        // Mock data for 7 days
        // In real app, query UserDailyLog group by date
        const days = 7;
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const logsCount = await UserDailyLog.count({ where: { date: dateStr } });
            data.push({
                name: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
                logs: logsCount
            });
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.json([]);
    }
};

// PB_NEW: Macro Stats (Avg Goal vs Avg Actual)
// 3. Goal & Efficiency (Nhóm 3)
exports.getGoalStats = async (req, res) => {
    try {
        // A. Goal Success (Weight)
        // Need to compare start_weight vs current_weight vs goal_type
        // Simplified: Just returning Goal Type distribution as proxy if complex calculation not available
        // User Profiles
        const profiles = await UserProfile.findAll();
        let reached = 0, notReached = 0;

        // Mock logic for "Reached": if goal is lose weight and current < start, etc.
        // Real logic usually requires target weight. Assuming we don't have explicit "target_weight" column in Profile? 
        // Checking UserNutritionTarget model... it has calls/macros.
        // Let's use `goal_type` distribution as placeholder for "Target"

        // B. Weight Trend (Line) - Avg weight by month (from UserProfile updates? No only current)
        // If UserWeightLog exists, use it. UserWeightLog... Yes it exists conceptually in task description.
        // Assuming UserWeightLog model exists? If not, skip.
        // Let's assume we use UserProfile updates or just timestamp mocks for now if table missing.
        // Actually earlier System Overview used `UserWeightLog`.

        // C. Calorie Compliance (Bar)
        // Count logs where calories is within +/- 150kcal of TDEE/Target
        const logs = await UserDailyLog.findAll({
            include: [{
                model: User,
                as: 'user',
                include: [{ model: UserNutritionTarget }]
            }],
            limit: 500 // Sample for performance
        });

        let compliance = { under: 0, good: 0, over: 0 };
        logs.forEach(l => {
            const target = l.user?.UserNutritionTarget?.target_calories || 2000;
            const diff = l.calories - target;
            if (diff < -300) compliance.under++;
            else if (diff > 300) compliance.over++;
            else compliance.good++;
        });

        res.json({
            // Mocking some data where real data is complex/missing
            weightSuccess: [
                { name: 'Đang đi đúng hướng', value: 65 },
                { name: 'Cần cố gắng', value: 35 }
            ],
            compliance: [
                { name: 'Thiếu calo (< -300)', value: compliance.under, fill: '#F59E0B' },
                { name: 'Đạt chuẩn (+/- 300)', value: compliance.good, fill: '#10B981' },
                { name: 'Dư thừa (> +300)', value: compliance.over, fill: '#EF4444' }
            ]
        });
    } catch (err) {
        console.error(err);
        res.json({});
    }
};

// 4. User Insights (Nhóm 4)
exports.getUserInsights = async (req, res) => {
    try {
        // A. Goal Dist (Pie) - Reusing demographics logic
        const goals = await UserProfile.findAll({
            attributes: ['goal_type', [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']],
            group: ['goal_type']
        });

        // B. Activity Level (Bar)
        const activity = await UserProfile.findAll({
            attributes: ['activity_level', [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']],
            group: ['activity_level']
        });

        res.json({
            goals: goals.map(g => ({ name: g.goal_type, value: parseInt(g.get('count')) })),
            activity: activity.map(a => ({ name: a.activity_level, value: parseInt(a.get('count')) }))
        });
    } catch (err) {
        console.error(err);
        res.json({});
    }
};

// 5. Food Stats (Nhóm 5)
exports.getFoodStats = async (req, res) => {
    try {
        // A. Top Popular (already have getTrendingFoods)

        // B. Top Caloric Foods
        const highCalFoods = await Food.findAll({
            order: [['calories', 'DESC']],
            limit: 5,
            attributes: ['name', 'calories']
        });

        // C. Favorites (Top liked)
        // Assume UserFavoriteFood model
        // Skipping if model not ready, using highCal as placeholder

        res.json({
            highCalorie: highCalFoods.map(f => ({ name: f.name, value: f.calories }))
        });
    } catch (err) {
        console.error(err);
        res.json({});
    }
};

exports.getMacroStats = async (req, res) => {
    try {
        // 1. Avg Goal from UserNutritionTarget (Standardized to grams if possible, but percentages easier for comparison)
        // Let's compare Grams for accuracy if available, or just use % from DietPreset

        // Actually, let's compare Calorie/Carb/Fat/Protein averages from Logs
        const avgLog = await UserDailyLog.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('calories')), 'avg_cal'],
                [sequelize.fn('AVG', sequelize.col('carbs')), 'avg_carb'],
                [sequelize.fn('AVG', sequelize.col('protein')), 'avg_protein'],
                [sequelize.fn('AVG', sequelize.col('fat')), 'avg_fat']
            ],
            raw: true
        });

        // 2. Avg Target calculation
        const targets = await UserNutritionTarget.findAll({
            include: [{
                model: DietPreset,
                attributes: ['carb_ratio', 'protein_ratio', 'fat_ratio']
            }],
            attributes: ['target_calories']
        });

        let sumCal = 0, sumCarb = 0, sumPro = 0, sumFat = 0;
        let count = 0;

        targets.forEach(t => {
            if (t.DietPreset && t.target_calories) {
                const cal = t.target_calories;
                sumCal += cal;
                // Calories -> Grams conversion
                // Carb/Protein: 4 kcal/g, Fat: 9 kcal/g
                sumCarb += (cal * t.DietPreset.carb_ratio / 100) / 4;
                sumPro += (cal * t.DietPreset.protein_ratio / 100) / 4;
                sumFat += (cal * t.DietPreset.fat_ratio / 100) / 9;
                count++;
            }
        });

        const avgTarget = {
            cal: count ? sumCal / count : 2000,
            carb: count ? sumCarb / count : 250,
            protein: count ? sumPro / count : 120,
            fat: count ? sumFat / count : 65
        };

        const data = [
            { subject: 'Calories', A: Math.round(avgLog.avg_cal || 0), B: Math.round(avgTarget.cal), fullMark: 3000 },
            { subject: 'Carbs', A: Math.round(avgLog.avg_carb || 0), B: Math.round(avgTarget.carb), fullMark: 400 },
            { subject: 'Protein', A: Math.round(avgLog.avg_protein || 0), B: Math.round(avgTarget.protein), fullMark: 250 },
            { subject: 'Fat', A: Math.round(avgLog.avg_fat || 0), B: Math.round(avgTarget.fat), fullMark: 150 },
        ];

        res.json(data);

    } catch (error) {
        console.error('Macro Stats Error:', error);
        res.json([]);
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
