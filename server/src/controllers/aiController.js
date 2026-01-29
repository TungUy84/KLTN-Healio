const aiService = require('../services/aiService');
const RawFood = require('../models/RawFood');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const UserProfile = require('../models/UserProfile');
const Food = require('../models/Food');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const generateRecipe = async (req, res) => {
    try {
        const { foodName } = req.body;
        if (!foodName) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên món ăn' });
        }

        // 1. Call AI to get ingredients
        const aiResult = await aiService.generateRecipeFromText(foodName);
        const { description, ingredients, serving_unit, meal_categories, diet_tags } = aiResult;

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
                    unit: '100g', // Default unit as requested
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
            serving_unit,
            meal_categories,
            diet_tags,
            ingredients: finalIngredients,
            newIngredientsCount: newCount
        });

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ message: 'Lỗi xử lý AI', error: error.message, details: error.toString() });
    }
};

const suggestMealPlan = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch User Data
        const nutritionTarget = await UserNutritionTarget.findOne({ where: { user_id: userId } });
        if (!nutritionTarget) {
            return res.status(404).json({ message: 'Vui lòng cập nhật mục tiêu dinh dưỡng trước (TDEE/Target).' });
        }

        const userProfile = await UserProfile.findOne({ where: { user_id: userId } });

        // 2. Fetch Available Foods (Random 60 items)
        const foods = await Food.findAll({
            where: { status: 'active' },
            limit: 60,
            order: sequelize.random(), // Randomize to get variety
            attributes: ['id', 'name', 'calories', 'protein', 'carb', 'fat', 'serving_unit'] // Added serving_unit
        });

        if (foods.length < 5) {
            return res.status(400).json({ message: 'Kho món ăn chưa đủ dữ liệu để gợi ý.' });
        }

        // 3. Call AI
        const plan = await aiService.suggestMealPlan(userProfile || {}, nutritionTarget, foods);

        // 4. Enrich Response with Full Food Details
        const meals = ['breakfast', 'lunch', 'dinner'];
        const richPlan = {
            ...plan,
            breakfast: { ...plan.breakfast, detail: foods.find(f => f.id === plan.breakfast.food_id) },
            lunch: { ...plan.lunch, detail: foods.find(f => f.id === plan.lunch.food_id) },
            dinner: { ...plan.dinner, detail: foods.find(f => f.id === plan.dinner.food_id) }
        };

        res.json(richPlan);

    } catch (error) {
        console.error("Suggest Meal Plan Error:", error);
        res.status(500).json({ message: 'Lỗi khi tạo thực đơn', error: error.message });
    }
};

module.exports = {
    generateRecipe,
    suggestMealPlan
};
