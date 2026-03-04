const UserDailyLog = require('../models/UserDailyLog');
const UserWeightLog = require('../models/UserWeightLog');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const Food = require('../models/Food');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment');

// Helper định dạng ngày
const getDatesRange = (period) => {
    let startDate = moment();
    const endDate = moment().endOf('day');

    switch (period) {
        case '7d': startDate = moment().subtract(7, 'days').startOf('day'); break;
        case '30d': startDate = moment().subtract(30, 'days').startOf('day'); break;
        case '3m': startDate = moment().subtract(3, 'months').startOf('day'); break;
        case '6m': startDate = moment().subtract(6, 'months').startOf('day'); break;
        case '1y': startDate = moment().subtract(1, 'years').startOf('day'); break;
        default: startDate = moment().subtract(7, 'days').startOf('day'); break; // Mặc định 7 ngày
    }
    return { startDate: startDate.toDate(), endDate: endDate.toDate() };
};

// 1. [GET] /api/users/stats/dashboard
// Lấy số liệu mồi cho Màn hình Tổng quan
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = getDatesRange('7d');

        // 1. Lấy mục tiêu dinh dưỡng
        const target = await UserNutritionTarget.findOne({ where: { user_id: userId } });
        const targetCalories = target?.target_calories || 2000;

        // 2. Lấy cân nặng hiện tại
        const profile = await UserProfile.findOne({ where: { user_id: userId } });
        
        let currentWeight = profile?.current_weight || 0;
        if (!currentWeight) {
            const lastWeight = await UserWeightLog.findOne({
                where: { user_id: userId },
                order: [['date', 'DESC']]
            });
            currentWeight = lastWeight ? lastWeight.weight : 0;
        }

        // 3. Tính lượng calo trung bình 7 ngày qua
        const dailyLogs = await UserDailyLog.findAll({
            where: {
                user_id: userId,
                date: { [Op.between]: [startDate, endDate] }
            },
            attributes: [
                'date',
                [Sequelize.fn('SUM', Sequelize.col('calories')), 'total_calories']
            ],
            group: ['date']
        });

        let totalCal = 0;
        let daysLogged = dailyLogs.length;
        let daysMetTarget = 0;

        dailyLogs.forEach(log => {
            const cal = parseFloat(log.get('total_calories') || 0);
            totalCal += cal;
            // Đạt mục tiêu nếu không vượt quá (hoặc nằm trong biên độ 10%)
            if (cal <= targetCalories * 1.1) { 
                daysMetTarget++;
            }
        });

        const avgCalories = daysLogged > 0 ? Math.round(totalCal / daysLogged) : 0;

        // 4. Tính Streak (Chuỗi ngày log liên tục tính từ hôm nay ngược về trước)
        // Tìm các ngày có log, sort desc
        const allLogsDates = await UserDailyLog.findAll({
            where: { user_id: userId },
            attributes: ['date'],
            group: ['date'],
            order: [['date', 'DESC']]
        });
        
        let streak = 0;
        let checkDate = moment().startOf('day');
        
        // Nếu hôm nay chưa có, lùi về hôm qua kiểm tra trước
        const todayStr = checkDate.format('YYYY-MM-DD');
        const yesterdayStr = moment(checkDate).subtract(1, 'days').format('YYYY-MM-DD');
        
        const loggedDates = allLogsDates.map(l => l.date);
        
        let currentDateIdx = 0;
        if (loggedDates.includes(todayStr)) {
            checkDate = moment(todayStr); // Bắt đầu đếm từ hôm nay
        } else if (loggedDates.includes(yesterdayStr)) {
            checkDate = moment(yesterdayStr); // Đếm từ hôm qua (vì hôm nay còn chưa hết ngày)
        } else {
            checkDate = null; // Mất streak
        }

        if (checkDate) {
            streak = 1;
            while (true) {
                const prevDate = moment(checkDate).subtract(streak, 'days').format('YYYY-MM-DD');
                if (loggedDates.includes(prevDate)) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        res.json({
            currentWeight,
            targetWeight: profile?.goal_weight || 0,
            avgCaloriesWeek: avgCalories,
            targetCalories,
            streak,
            consistencyScore: daysLogged > 0 ? Math.round((daysMetTarget / daysLogged) * 100) : 0
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. [GET] /api/users/stats/nutrition
// Màn hình 1: Xu hướng dinh dưỡng (Timeline, Donut macros)
exports.getNutritionStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || '7d';
        const { startDate, endDate } = getDatesRange(period);

        const target = await UserNutritionTarget.findOne({ where: { user_id: userId } });
        
        const logs = await UserDailyLog.findAll({
            where: { user_id: userId, date: { [Op.between]: [startDate, endDate] } },
            attributes: [
                'date',
                [Sequelize.fn('SUM', Sequelize.col('calories')), 'calories'],
                [Sequelize.fn('SUM', Sequelize.col('carb')), 'carb'],
                [Sequelize.fn('SUM', Sequelize.col('protein')), 'protein'],
                [Sequelize.fn('SUM', Sequelize.col('fat')), 'fat'],
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        let totalCarb = 0, totalProtein = 0, totalFat = 0;
        const dailyData = logs.map(l => {
            const cb = parseFloat(l.get('carb') || 0);
            const pt = parseFloat(l.get('protein') || 0);
            const ft = parseFloat(l.get('fat') || 0);
            totalCarb += cb;
            totalProtein += pt;
            totalFat += ft;

            return {
                date: l.date,
                calories: Math.round(parseFloat(l.get('calories') || 0)),
                carb: Math.round(cb),
                protein: Math.round(pt),
                fat: Math.round(ft),
            }
        });

        // Generate full date list to fill gaps with 0
        const fullData = [];
        let curr = moment(startDate);
        const end = moment(endDate);
        while (curr <= end) {
            const d = curr.format('YYYY-MM-DD');
            const found = dailyData.find(x => x.date === d);
            fullData.push(found || { date: d, calories: 0, carb: 0, protein: 0, fat: 0 });
            curr.add(1, 'days');
        }

        res.json({
            target: {
                calories: target?.target_calories || 2000,
                carb: target?.target_carb_g || 250,
                protein: target?.target_protein_g || 150,
                fat: target?.target_fat_g || 65
            },
            timeline: fullData,
            macroSplit: {
                carb: Math.round(totalCarb),
                protein: Math.round(totalProtein),
                fat: Math.round(totalFat)
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. [GET] /api/users/stats/body
// Màn hình 2: Tiến độ cơ thể
exports.getBodyStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || '3m';
        const { startDate, endDate } = getDatesRange(period);

        const profile = await UserProfile.findOne({ where: { user_id: userId } });
        
        const weightLogs = await UserWeightLog.findAll({
            where: { user_id: userId, date: { [Op.between]: [startDate, endDate] } },
            order: [['date', 'ASC']],
            attributes: ['date', 'weight']
        });

        // Logic tính tốc độ giảm cân
        let weightChangeRate = 0; 
        if (weightLogs.length >= 2) {
            const firstW = weightLogs[0].weight;
            const lastW = weightLogs[weightLogs.length - 1].weight;
            const daysDiff = moment(weightLogs[weightLogs.length-1].date).diff(moment(weightLogs[0].date), 'days');
            if (daysDiff > 0) {
                // Tốc độ thay đổi theo tuần
                weightChangeRate = ((lastW - firstW) / daysDiff) * 7; 
            }
        }

        // Tính BMI hiện tại
        let bmi = 0;
        const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : profile?.current_weight;
        const h = profile?.height;
        if (h && currentWeight) {
            const hMeters = h / 100;
            bmi = currentWeight / (hMeters * hMeters);
        }

        res.json({
            history: weightLogs,
            currentWeight: currentWeight || 0,
            goalWeight: profile?.goal_weight || 0,
            height: h || 0,
            bmi: parseFloat(bmi.toFixed(1)),
            changeRatePerWeek: parseFloat(weightChangeRate.toFixed(2)) // âm = giảm, dương = tăng
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 4. [GET] /api/users/stats/food-insights
// Màn hình 3: Thói quen ăn uống (Meal dist, Top foods)
exports.getFoodInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || '30d';
        const { startDate, endDate } = getDatesRange(period);

        // A. Phân bố bữa ăn (Meal distribution)
        const meals = await UserDailyLog.findAll({
            where: { user_id: userId, date: { [Op.between]: [startDate, endDate] } },
            attributes: [
                'meal_type',
                [Sequelize.fn('SUM', Sequelize.col('calories')), 'total_calories']
            ],
            group: ['meal_type']
        });

        // B. Bảng xếp hạng Top món ăn theo năng lượng đóng góp
        const topFoods = await UserDailyLog.findAll({
            where: { user_id: userId, date: { [Op.between]: [startDate, endDate] } },
            attributes: [
                'food_id',
                [Sequelize.fn('SUM', Sequelize.col('UserDailyLog.calories')), 'contrib_calories'],
                [Sequelize.fn('COUNT', Sequelize.col('UserDailyLog.id')), 'times_eaten']
            ],
            include: [{ model: Food, as: 'food', attributes: ['name', 'image'] }],
            group: ['food_id', 'food.id', 'food.name', 'food.image'],
            order: [[Sequelize.literal('contrib_calories'), 'DESC']],
            limit: 5
        });

        // C. Lấy Heatmap Consistency (Giống github)
        const heatmap = await UserDailyLog.findAll({
            where: { user_id: userId, date: { [Op.between]: [startDate, endDate] } },
            attributes: [
                'date',
                [Sequelize.fn('SUM', Sequelize.col('calories')), 'calories'] // Dùng calo để đánh màu
            ],
            group: ['date']
        });

        res.json({
            mealDistribution: meals.map(m => ({ meal: m.meal_type, calories: Math.round(parseFloat(m.get('total_calories'))) })),
            topFoods: topFoods.map(f => ({
                id: f.food_id,
                name: f.food?.name,
                image: f.food?.image,
                calories: Math.round(parseFloat(f.get('contrib_calories'))),
                timesEaten: parseInt(f.get('times_eaten'))
            })),
            consistency: heatmap.map(h => ({
                date: h.date,
                calories: Math.round(parseFloat(h.get('calories')))
            }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};