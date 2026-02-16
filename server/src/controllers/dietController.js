const DietPreset = require('../models/DietPreset');
const { Op } = require('sequelize');

// Get all diet presets
exports.getAllDiets = async (req, res) => {
    try {
        const { search, sort, order } = req.query;

        const where = {};
        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const orderClause = [];
        if (sort && order) {
            orderClause.push([sort, order.toUpperCase()]);
        } else {
            orderClause.push(['id', 'ASC']);
        }

        const diets = await DietPreset.findAll({
            where,
            order: orderClause
        });

        res.json({
            success: true,
            data: diets
        });
    } catch (error) {
        console.error('Error getting diets:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách chế độ ăn'
        });
    }
};

// Get diet by ID
exports.getDietById = async (req, res) => {
    try {
        const { id } = req.params;
        const diet = await DietPreset.findByPk(id);

        if (!diet) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chế độ ăn'
            });
        }

        res.json({
            success: true,
            data: diet
        });
    } catch (error) {
        console.error('Error getting diet by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin chế độ ăn'
        });
    }
};

// Create new diet
exports.createDiet = async (req, res) => {
    try {
        const { name, code, description, carb_ratio, protein_ratio, fat_ratio } = req.body;

        // Validation
        if (!name || !code || carb_ratio === undefined || protein_ratio === undefined || fat_ratio === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Check total ratio
        const total = Number(carb_ratio) + Number(protein_ratio) + Number(fat_ratio);
        if (total !== 100) {
            return res.status(400).json({
                success: false,
                message: `Tổng tỷ lệ Macro phải bằng 100% (Hiện tại: ${total}%)`
            });
        }

        // Check duplicate code
        const existingDiet = await DietPreset.findOne({ where: { code } });
        if (existingDiet) {
            return res.status(400).json({
                success: false,
                message: 'Mã chế độ ăn đã tồn tại'
            });
        }

        const newDiet = await DietPreset.create({
            name,
            code: code.toUpperCase(),
            description,
            carb_ratio,
            protein_ratio,
            fat_ratio
        });

        res.status(201).json({
            success: true,
            message: 'Tạo chế độ ăn thành công',
            data: newDiet
        });
    } catch (error) {
        console.error('Error creating diet:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo chế độ ăn'
        });
    }
};

// Update diet
exports.updateDiet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, carb_ratio, protein_ratio, fat_ratio } = req.body;

        const diet = await DietPreset.findByPk(id);
        if (!diet) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chế độ ăn'
            });
        }

        // Check total ratio if any ratio is updated
        if (carb_ratio !== undefined || protein_ratio !== undefined || fat_ratio !== undefined) {
            const newCarb = carb_ratio !== undefined ? Number(carb_ratio) : diet.carb_ratio;
            const newProtein = protein_ratio !== undefined ? Number(protein_ratio) : diet.protein_ratio;
            const newFat = fat_ratio !== undefined ? Number(fat_ratio) : diet.fat_ratio;

            if (newCarb + newProtein + newFat !== 100) {
                return res.status(400).json({
                    success: false,
                    message: `Tổng tỷ lệ Macro phải bằng 100% (Hiện tại: ${newCarb + newProtein + newFat}%)`
                });
            }
        }

        // Check duplicate code if code is updated
        if (code && code !== diet.code) {
            const existingDiet = await DietPreset.findOne({ where: { code } });
            if (existingDiet) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã chế độ ăn đã tồn tại'
                });
            }
        }

        await diet.update({
            name: name || diet.name,
            code: code ? code.toUpperCase() : diet.code,
            description: description !== undefined ? description : diet.description,
            carb_ratio: carb_ratio !== undefined ? carb_ratio : diet.carb_ratio,
            protein_ratio: protein_ratio !== undefined ? protein_ratio : diet.protein_ratio,
            fat_ratio: fat_ratio !== undefined ? fat_ratio : diet.fat_ratio
        });

        res.json({
            success: true,
            message: 'Cập nhật chế độ ăn thành công',
            data: diet
        });
    } catch (error) {
        console.error('Error updating diet:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật chế độ ăn'
        });
    }
};

// Delete diet
exports.deleteDiet = async (req, res) => {
    try {
        const { id } = req.params;
        const diet = await DietPreset.findByPk(id);

        if (!diet) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chế độ ăn'
            });
        }

        // TODO: Check if diet is used by any user before deleting (optional but recommended)

        await diet.destroy();

        res.json({
            success: true,
            message: 'Xóa chế độ ăn thành công'
        });
    } catch (error) {
        console.error('Error deleting diet:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa chế độ ăn'
        });
    }
};
