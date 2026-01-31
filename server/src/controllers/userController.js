const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');
const UserFavoriteFood = require('../models/UserFavoriteFood');
const UserDailyLog = require('../models/UserDailyLog');
const Food = require('../models/Food');
const UserWeightLog = require('../models/UserWeightLog');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// --- Helper: Calculate Age ---
const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// --- Helper: Calculate BMR (Mifflin-St Jeor) ---
const calculateBMR = (gender, weight, height, age) => {
    if (!weight || !height || !age) return 0;
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'male' ? 5 : -161;
    return Math.round(bmr);
};

// --- Helper: Get Activity Multiplier ---
const getActivityMultiplier = (level) => {
    switch (level) {
        case 'sedentary': return 1.2;
        case 'light': return 1.375;
        case 'moderate': return 1.55;
        case 'active': return 1.725;
        case 'very_active': return 1.9;
        default: return 1.2;
    }
};

// API: Cập nhật Profile (PB_30, PB_31, PB_33, PB_34, PB_35, PB_37)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            full_name, avatar, // PB_30, PB_31
            dob, height, current_weight, activity_level, gender, // PB_30, PB_33
            goal_type, goal_weight, // PB_34
            diet_preset_code, // PB_35
            allergies // PB_37
        } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Update User basic info
        if (full_name !== undefined) user.full_name = full_name;
        if (avatar !== undefined) user.avatar = avatar;
        await user.save();

        // 2. Update UserProfile
        let profile = await UserProfile.findOne({ where: { user_id: userId } });
        if (!profile) {
            profile = await UserProfile.create({ user_id: userId });
        }

        const updateData = {};
        if (dob !== undefined) updateData.dob = dob;
        if (height !== undefined) updateData.height = height;
        if (current_weight !== undefined) updateData.current_weight = current_weight;
        if (activity_level !== undefined) updateData.activity_level = activity_level;
        if (gender !== undefined) updateData.gender = gender;
        if (goal_type !== undefined) updateData.goal_type = goal_type;
        if (goal_weight !== undefined) updateData.goal_weight = goal_weight;
        if (allergies !== undefined) updateData.allergies = allergies;

        await profile.update(updateData);

        // 3. PB_30 AC4: Recalculate BMR/TDEE & Nutrition Target
        // Check if any factor affecting TDEE has changed
        if (dob || height || current_weight || activity_level || gender) {
            let nutrition = await UserNutritionTarget.findOne({ where: { user_id: userId } });

            // Need current values (fallback to profile if not in body)
            const pGender = gender || profile.gender;
            const pDob = dob || profile.dob;
            const pHeight = height || profile.height;
            const pWeight = current_weight || profile.current_weight;
            const pActivity = activity_level || profile.activity_level;

            if (pGender && pDob && pHeight && pWeight && pActivity) {
                const age = calculateAge(pDob);
                const bmr = calculateBMR(pGender, pWeight, pHeight, age);
                const multiplier = getActivityMultiplier(pActivity);
                const tdee = Math.round(bmr * multiplier);

                // Nutrition logic (simplified): 
                // Lose weight: -500, Gain weight: +500
                const pGoal = goal_type || profile.goal_type;
                let targetCalories = tdee;
                if (pGoal === 'lose_weight') targetCalories -= 500;
                else if (pGoal === 'gain_weight') targetCalories += 500;

                // Ensure min calories (safety)
                if (targetCalories < 1200) targetCalories = 1200;

                if (nutrition) {
                    await nutrition.update({ tdee, target_calories: targetCalories });
                } else {
                    // Create if not exists (should rarely happen if onboarded)
                    await UserNutritionTarget.create({
                        user_id: userId,
                        tdee,
                        target_calories: targetCalories,
                        diet_preset_id: null // Or default
                    });
                }
            }
        }

        // PB_35: Update Diet Preset
        if (diet_preset_code) {
            const preset = await ensureDietPreset(diet_preset_code);
            let nutrition = await UserNutritionTarget.findOne({ where: { user_id: userId } });
            if (nutrition) {
                await nutrition.update({ diet_preset_id: preset.id });
            }
        }

        // Return updated full profile
        const updatedUser = await User.findByPk(userId, {
            attributes: ['id', 'email', 'full_name', 'role', 'avatar'],
            include: [
                { model: UserProfile },
                { model: UserNutritionTarget, include: [DietPreset] }
            ]
        });

        res.json(updatedUser);

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// PB_31: Upload Avatar
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const avatarPath = `/uploads/${req.file.filename}`;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.avatar = avatarPath;
        await user.save();

        res.json({ message: 'Avatar uploaded successfully', avatar: avatarPath });
    } catch (err) {
        console.error('Upload Avatar Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// PB_28: Cập nhật cân nặng (Log History)
exports.logWeight = async (req, res) => {
    try {
        const userId = req.user.id;
        const { weight, date } = req.body;

        if (!weight) return res.status(400).json({ message: 'Weight is required' });

        const logDate = date || new Date();

        // 1. Create Log
        await UserWeightLog.create({
            user_id: userId,
            weight: parseFloat(weight),
            date: logDate
        });

        // 2. Update Current Weight in Profile
        // This will trigger 'updateProfile' logic if we called it, but here we do it manually or call updateProfile?
        // Let's do manual update for efficiency, but we SHOULD recalculate TDEE too.
        // For simplicity reusing updateProfile logic is best, but separate function is faster.
        // Let's just update and Recalculate here to be consistent.

        const profile = await UserProfile.findOne({ where: { user_id: userId } });
        if (profile) {
            await profile.update({ current_weight: parseFloat(weight) });

            // Recalculate TDEE Logic
            const age = calculateAge(profile.dob);
            const bmr = calculateBMR(profile.gender, parseFloat(weight), profile.height, age);
            const multiplier = getActivityMultiplier(profile.activity_level);
            const tdee = Math.round(bmr * multiplier);

            const pGoal = profile.goal_type;
            let targetCalories = tdee;
            if (pGoal === 'lose_weight') targetCalories -= 500;
            else if (pGoal === 'gain_weight') targetCalories += 500;
            if (targetCalories < 1200) targetCalories = 1200;

            const nutrition = await UserNutritionTarget.findOne({ where: { user_id: userId } });
            if (nutrition) {
                await nutrition.update({ tdee, target_calories: targetCalories });
            }
        }

        res.json({ success: true, message: 'Đã cập nhật cân nặng' });

    } catch (err) {
        console.error('Log Weight Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Helper: Predict and Sync Weight based on Calories
const predictAndSyncWeight = async (userId) => {
    try {
        // 1. Get the very last weight log
        const lastWeightLog = await UserWeightLog.findOne({
            where: { user_id: userId },
            order: [['date', 'DESC']]
        });

        if (!lastWeightLog) return; // No baseline to predict from

        const lastDate = new Date(lastWeightLog.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If last log is today or future, nothing to do
        if (lastDate >= today) return;

        // 2. Get User TDEE
        const nutrition = await UserNutritionTarget.findOne({ where: { user_id: userId } });
        const tdee = nutrition ? nutrition.tdee : 2000;

        // 3. Loop from day after last log until yesterday
        let currentDate = new Date(lastDate);
        currentDate.setDate(currentDate.getDate() + 1);

        let currentWeight = parseFloat(lastWeightLog.weight);
        const newLogs = [];

        while (currentDate < today) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // Check if there are food logs for this day
            // We use SUM to get total calories
            const totalCals = await UserDailyLog.sum('calories', {
                where: { user_id: userId, date: dateStr }
            });

            // Logic: Only update if user tracked food (e.g., > 500 calories to imply usage)
            // If they didn't use the app, we hold the weight constant (or could apply BMR burn, but risky)
            if (totalCals && totalCals > 500) {
                const diff = totalCals - tdee;
                // 7700 kcal = 1kg
                const weightChange = diff / 7700;
                currentWeight += weightChange;

                newLogs.push({
                    user_id: userId,
                    weight: parseFloat(currentWeight.toFixed(2)),
                    date: dateStr,
                    is_predicted: true // If we had this field
                });
            } else {
                // If no data, keep weight same as previous day?
                // Or just skip logging?
                // Let's Skip logging to keep chart clean -> No, user wants continuous line. 
                // Let's NOT log if no data (assume constant) - Chart will connect lines.
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 4. Bulk Create predicted logs
        if (newLogs.length > 0) {
            await UserWeightLog.bulkCreate(newLogs);

            // Update Profile current_weight to the latest predicted value
            const latestPred = newLogs[newLogs.length - 1];
            await UserProfile.update(
                { current_weight: latestPred.weight },
                { where: { user_id: userId } }
            );
        }

    } catch (e) {
        console.error("Auto Sync Weight Error", e);
    }
};

// PB_27: Xem lịch sử cân nặng
exports.getWeightHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Trigger Auto-Sync before fetching
        await predictAndSyncWeight(userId);

        const logs = await UserWeightLog.findAll({
            where: { user_id: userId },
            order: [['date', 'ASC']]
        });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PB_26: Biểu đồ Calo tuần
exports.getWeeklyStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 7 days range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);

        const logs = await UserDailyLog.findAll({
            where: {
                user_id: userId,
                date: {
                    [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
                }
            },
            attributes: [
                'date',
                [sequelize.fn('SUM', sequelize.col('calories')), 'totalCalories']
            ],
            group: ['date'],
            order: [['date', 'ASC']],
            raw: true
        });

        // Get TDEE
        let tdee = 2000; // Default
        const nutrition = await UserNutritionTarget.findOne({ where: { user_id: userId } });
        if (nutrition) {
            tdee = nutrition.tdee; // Or target_calories if comparing against goal
        }

        // Fill missing dates
        const stats = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            stats.push({
                date: dateStr,
                calories: log ? parseFloat(log.totalCalories) : 0,
                tdee: tdee
            });
        }

        res.json(stats);
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// PB_38: Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user.password_hash) {
            return res.status(400).json({ message: 'Tài khoản này đăng nhập bằng Google, không thể đổi mật khẩu.' });
        }

        const validPass = await bcrypt.compare(oldPassword, user.password_hash);
        if (!validPass) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await user.update({ password_hash: hash });

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API: Seed Diet Preset mặc định
const DEFAULT_PRESETS = [
    { code: 'balanced', name: 'Cân bằng', carb_ratio: 45, protein_ratio: 30, fat_ratio: 25, description: 'Phù hợp đa số người Việt. Đầy đủ nhóm chất.' },
    { code: 'high_protein', name: 'High Protein', carb_ratio: 40, protein_ratio: 35, fat_ratio: 25, description: 'Ăn nhiều đạm, giúp no lâu.' },
    { code: 'low_carb', name: 'Low Carb', carb_ratio: 25, protein_ratio: 35, fat_ratio: 40, description: 'Hạn chế tinh bột tối đa.' },
    { code: 'high_carb', name: 'High Carb', carb_ratio: 50, protein_ratio: 30, fat_ratio: 20, description: 'Nhiều năng lượng cho tập luyện.' },
    { code: 'keto', name: 'Keto', carb_ratio: 5, protein_ratio: 25, fat_ratio: 70, description: 'Rất ít Carb, nhiều chất béo.' }
];

// Helper: Đảm bảo Diet Preset tồn tại, nếu không thì tạo mới từ default
const ensureDietPreset = async (code) => {
    let preset = await DietPreset.findOne({ where: { code } });
    if (!preset) {
        const defaultData = DEFAULT_PRESETS.find(p => p.code === code);
        if (defaultData) {
            preset = await DietPreset.create(defaultData);
        }
    }
    return preset;
};

// API: Lấy thông tin User Profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'full_name', 'role', 'avatar'],
            include: [
                { model: UserProfile },
                { model: UserNutritionTarget, include: [DietPreset] }
            ]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// PB_19: Get Favorites
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await UserFavoriteFood.findAll({
            where: { user_id: userId },
            include: [{
                model: Food,
                attributes: ['id', 'name', 'image', 'calories', 'serving_unit']
            }]
        });
        // Flatten structure for easier frontend consumption
        const result = favorites.map(f => {
            const food = f.Food;
            if (!food) return null;
            return {
                id: food.id,
                name: food.name,
                image: food.image,
                calories: food.calories,
                serving_unit: food.serving_unit,
                favorite_at: f.createdAt
            }
        }).filter(item => item !== null);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích' });
    }
};

// PB_19, PB_22: Toggle Favorite
exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { food_id } = req.body;

        if (!food_id) return res.status(400).json({ message: 'food_id is required' });

        const foodId = parseInt(food_id);

        const existing = await UserFavoriteFood.findOne({
            where: { user_id: userId, food_id: foodId }
        });

        let isFavorite = false;
        if (existing) {
            await existing.destroy();
            isFavorite = false;
        } else {
            await UserFavoriteFood.create({ user_id: userId, food_id: foodId });
            isFavorite = true;
        }

        res.json({ success: true, isFavorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái yêu thích' });
    }
};

// PB_23: Add to Diary
exports.addToDiary = async (req, res) => {
    try {
        const userId = req.user.id;
        // Expect body: { food_id, meal_type, date, quantity, ... }
        // Note: FE sends 'quantity', DB model expects 'amount'
        const { food_id, meal_type, quantity, date } = req.body;

        if (!food_id || !meal_type || !quantity || !date) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Lookup food for snapshot
        const food = await Food.findByPk(food_id);
        if (!food) {
            return res.status(404).json({ message: 'Món ăn không tồn tại' });
        }

        const amount = parseFloat(quantity);

        const log = await UserDailyLog.create({
            user_id: userId,
            food_id,
            meal_type,
            date,
            amount: amount,
            calories: (food.calories || 0) * amount,
            protein: (food.protein || 0) * amount,
            carb: (food.carb || 0) * amount,
            fat: (food.fat || 0) * amount,
            fiber: (food.fiber || 0) * amount
        });

        res.json({ success: true, data: log });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm vào nhật ký' });
    }
};

// PB_23 (View Diary result in Dashboard)
exports.getDailyLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = req.query.date; // YYYY-MM-DD

        if (!date) return res.status(400).json({ message: 'Date is required' });

        const logs = await UserDailyLog.findAll({
            where: { user_id: userId, date: date },
            include: [{ model: Food, as: 'food', attributes: ['name', 'image', 'serving_unit'] }]
        });

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy nhật ký' });
    }
};

// PB_16: Update Daily Log (Edit)
exports.updateDailyLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = req.params.id;
        const { quantity } = req.body; // New quantity

        if (!quantity) return res.status(400).json({ message: 'Quantity is required' });

        const log = await UserDailyLog.findOne({ where: { id: logId, user_id: userId } });
        if (!log) return res.status(404).json({ message: 'Log not found' });

        // Recalculate macros based on new quantity
        // Assuming we store snapshot, or simpler: lookup food again (better for data consistency if food changed, but typically we want the original food stats)
        // Here, let's look up the food again to be safe and simple
        const food = await Food.findByPk(log.food_id);
        if (!food) {
            return res.status(404).json({ message: 'Món ăn gốc không còn tồn tại' });
        }

        const amount = parseFloat(quantity);

        await log.update({
            amount: amount,
            calories: (food.calories || 0) * amount,
            protein: (food.protein || 0) * amount,
            carb: (food.carb || 0) * amount,
            fat: (food.fat || 0) * amount,
            fiber: (food.fiber || 0) * amount
        });

        res.json({ success: true, data: log });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cập nhật nhật ký' });
    }
};

// PB_17: Delete Daily Log
exports.deleteDailyLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = req.params.id;

        const log = await UserDailyLog.findOne({ where: { id: logId, user_id: userId } });
        if (!log) return res.status(404).json({ message: 'Log not found' });

        await log.destroy();

        res.json({ success: true, message: 'Đã xóa nhật ký' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xóa nhật ký' });
    }
};

// API: Hoàn thành Onboarding
// Nhận: gender, dob, height, weight, activity_level, goal_type, target_weight, diet_preset_code, tdee, target_calories
exports.completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            gender, dob, height, current_weight, activity_level, goal_type, goal_weight, // Profile
            diet_preset_code, tdee, target_calories // Nutrition
        } = req.body;

        // 1. Lưu Profile
        let profile = await UserProfile.findOne({ where: { user_id: userId } });
        if (profile) {
            await profile.update({ gender, dob, height, current_weight, activity_level, goal_type, goal_weight });
        } else {
            await UserProfile.create({
                user_id: userId,
                gender, dob, height, current_weight, activity_level, goal_type, goal_weight
            });
        }

        // 2. Tìm Diet Preset ID từ code
        let dietPreset = null;
        if (diet_preset_code) {
            dietPreset = await ensureDietPreset(diet_preset_code);
        }

        // 3. Lưu Nutrition Target
        let nutrition = await UserNutritionTarget.findOne({ where: { user_id: userId } });
        if (nutrition) {
            await nutrition.update({
                diet_preset_id: dietPreset ? dietPreset.id : null,
                tdee,
                target_calories
            });
        } else {
            await UserNutritionTarget.create({
                user_id: userId,
                diet_preset_id: dietPreset ? dietPreset.id : null,
                tdee,
                target_calories
            });
        }

        // 4. Trả về kết quả
        res.json({ message: 'Onboarding completed successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// API: Helper để lấy danh sách Diet Inputs cho Frontend chọn
exports.getDietPresets = async (req, res) => {
    try {
        let presets = await DietPreset.findAll();
        // Nếu chưa có DB thì seed data
        if (presets.length === 0) {
            await DietPreset.bulkCreate(DEFAULT_PRESETS);
            presets = await DietPreset.findAll();
        }
        res.json(presets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};