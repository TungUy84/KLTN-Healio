const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');
const UserFavoriteFood = require('../models/UserFavoriteFood');
const UserDailyLog = require('../models/UserDailyLog');
const Food = require('../models/Food');

// API: Seed một số Diet Preset mặc định nếu chưa có
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
            attributes: ['id', 'email', 'full_name', 'role'],
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