const aiService = require('../services/aiService');
const RawFood = require('../models/RawFood');
const { Op } = require('sequelize');

const generateRecipe = async (req, res) => {
    try {
        const { foodName } = req.body;
        if (!foodName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên món ăn' });
        }

        // 1. Call AI to get ingredients
        const aiResult = await aiService.generateRecipeFromText(foodName);
        const { description, ingredients } = aiResult;

        const finalIngredients = [];
        let newCount = 0;

        // 2. Smart Sync Logic
        for (const item of ingredients) {
            // Check if RawFood exists (Case-insensitive)
            let rawFood = await RawFood.findOne({
                where: {
                    name: { [Op.iLike]: item.name }
                }
            });

            if (!rawFood) {
                // If not exists, create new RawFood
                // Code Format: AI_{Timestamp}_{Random3Digits}
                const newCode = `AI_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                rawFood = await RawFood.create({
                    code: newCode,
                    name: item.name,
                    unit: 'g', // Default unit as requested
                    status: 'active', // Default status as requested
                    energy_kcal: item.calories || 0,
                    protein_g: item.protein || 0,
                    fat_g: item.fat || 0,
                    carb_g: item.carb || 0,
                    description: `Tạo tự động bởi AI từ món: ${foodName}`
                });
                newCount++;
            }

            finalIngredients.push({
                raw_food_id: rawFood.id,
                name: rawFood.name, // Return name for display
                amount: item.amount || 100,
                unit: 'g',
                calories: rawFood.energy_kcal, // Return DB info to be sure
                protein: rawFood.protein_g,
                fat: rawFood.fat_g,
                carb: rawFood.carb_g
            });
        }

        res.json({
            success: true,
            description,
            ingredients: finalIngredients,
            newIngredientsCount: newCount
        });

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ message: 'Lỗi xử lý AI', error: error.message, details: error.toString() });
    }
};

module.exports = {
    generateRecipe
};
