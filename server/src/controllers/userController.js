const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const DietPreset = require('../models/DietPreset');

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