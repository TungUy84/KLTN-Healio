const Food = require('../models/Food');
const RawFood = require('../models/RawFood');
const FoodIngredient = require('../models/FoodIngredient');

const UserFavoriteFood = require('../models/UserFavoriteFood');
const DietPreset = require('../models/DietPreset');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// PB_51: Get List Foods with Pagination, Search and Filters
exports.getFoods = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || 'created_at';
        const order = req.query.order || 'DESC';

        // AC2: Filters
        const mealCategory = req.query.meal_category; // Keep as meal_category for backward compatibility or rename if needed
        const dietTag = req.query.diet_tag;
        const calorieMin = req.query.calorie_min ? parseFloat(req.query.calorie_min) : null;
        const calorieMax = req.query.calorie_max ? parseFloat(req.query.calorie_max) : null;
        const status = req.query.status;

        const where = {};

        // AC3: Search by name
        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (mealCategory) {
            where.meal_categories = { [Op.contains]: [mealCategory] };
        }

        const include = [];

        // Updated Filter logic using Association
        if (dietTag) {
            // Find foods that have this diet preset
            include.push({
                model: DietPreset,
                as: 'dietPresets',
                where: { code: dietTag },
                attributes: ['id', 'code', 'name'],
                through: { attributes: [] } // Don't include join table data
            });
        } else {
            // Include diet presets anyway for display
            include.push({
                model: DietPreset,
                as: 'dietPresets',
                attributes: ['id', 'code', 'name'],
                through: { attributes: [] }
            });
        }

        if (calorieMin !== null || calorieMax !== null) {
            where.calories = {};
            if (calorieMin !== null) {
                where.calories[Op.gte] = calorieMin;
            }
            if (calorieMax !== null) {
                where.calories[Op.lte] = calorieMax;
            }
        }

        if (status) {
            where.status = status;
        } else {
            where.status = { [Op.ne]: 'deleted' };
        }

        const offset = (page - 1) * limit;

        const orderClause = [[sequelize.col(`Food.${sort}`), order]];

        const { count, rows } = await Food.findAndCountAll({
            where,
            include,
            order: orderClause,
            distinct: true, // Important for correct count with includes
            limit,
            offset
        });

        res.json({
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách món ăn:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách món ăn', error: error.message });
    }
};

// Get Food by ID
exports.getFoodById = async (req, res) => {
    try {
        const foodId = req.params.id;
        const userId = req.user ? req.user.id : null;

        const food = await Food.findByPk(foodId, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams']
                }
            }, {
                model: DietPreset,
                as: 'dietPresets',
                attributes: ['id', 'code', 'name'],
                through: { attributes: [] }
            }]
        });
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }

        let isFavorite = false;
        if (userId) {
            const fav = await UserFavoriteFood.findOne({
                where: { user_id: userId, food_id: foodId }
            });
            isFavorite = !!fav;
        }

        const foodData = food.toJSON();
        foodData.is_favorite = isFavorite;

        res.json(foodData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching food', error: error.message });
    }
};

// Create Food
exports.createFood = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, serving_unit, description, meal_categories, total_calories, total_protein, total_carb, total_fat, diet_tags, status, ingredients, micronutrients } = req.body;

        let parsedCategories = meal_categories;
        if (typeof meal_categories === 'string') {
            try {
                parsedCategories = JSON.parse(meal_categories);
            } catch (e) {
                parsedCategories = [];
            }
        }

        let parsedDietTags = diet_tags || [];
        if (typeof diet_tags === 'string') {
            try {
                parsedDietTags = JSON.parse(diet_tags);
            } catch (e) {
                parsedDietTags = [];
            }
        }

        let parsedIngredients = [];
        if (ingredients && typeof ingredients === 'string') {
            try {
                parsedIngredients = JSON.parse(ingredients);
            } catch (e) {
                parsedIngredients = [];
            }
        } else if (Array.isArray(ingredients)) {
            parsedIngredients = ingredients;
        }

        let parsedMicronutrients = micronutrients || {};
        if (typeof micronutrients === 'string') {
            try {
                parsedMicronutrients = JSON.parse(micronutrients);
                console.log('Micronutrients Parsed Successfully:', parsedMicronutrients);
            } catch (e) {
                console.error('Failed to parse micronutrients:', e.message);
                parsedMicronutrients = {};
            }
        } else {
            console.log('Micronutrients is already an object/null:', parsedMicronutrients);
        }

        const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!Array.isArray(parsedCategories)) {
            parsedCategories = [];
        }
        parsedCategories = parsedCategories.filter(cat => validCategories.includes(cat));

        const newFood = await Food.create({
            name,
            serving_unit: serving_unit || 'suất',
            cooking: description || '',
            meal_categories: parsedCategories,
            calories: total_calories ? parseFloat(total_calories) : 0,
            protein: total_protein ? parseFloat(total_protein) : 0,
            carb: total_carb ? parseFloat(total_carb) : 0,
            fat: total_fat ? parseFloat(total_fat) : 0,
            status: status || 'active',
            micronutrients: parsedMicronutrients,
            image: req.file ? `/uploads/${req.file.filename}` : null,

            created_by_user_id: req.user?.id || null
        }, { transaction });

        // Handle Diet Presets (new logic)
        if (parsedDietTags.length > 0) {
            // Find IDs for these codes
            const presets = await DietPreset.findAll({
                where: {
                    code: { [Op.in]: parsedDietTags }
                },
                attributes: ['id']
            });
            const presetIds = presets.map(p => p.id);
            if (presetIds.length > 0) {
                await newFood.setDietPresets(presetIds, { transaction });
            }
        }

        if (parsedIngredients.length > 0) {
            const ingredientsToCreate = parsedIngredients.map(ing => ({
                food_id: newFood.id,
                raw_food_id: ing.ingredient_id || ing.raw_food_id,
                amount_in_grams: parseFloat(ing.amount_in_grams || ing.quantity_g || 0)
            }));
            await FoodIngredient.bulkCreate(ingredientsToCreate, { transaction });
        }

        await transaction.commit();

        const foodWithIngredients = await Food.findByPk(newFood.id, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams']
                }
            }]
        });

        res.status(201).json(foodWithIngredients);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error creating food', error: error.message });
    }
};

// Update Food
exports.updateFood = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, serving_unit, description, meal_categories, total_calories, total_protein, total_carb, total_fat, diet_tags, status, ingredients, micronutrients } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (serving_unit) updateData.serving_unit = serving_unit;
        if (description !== undefined) updateData.cooking = description;
        if (status) updateData.status = status;

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        if (meal_categories) {
            let parsedCategories = meal_categories;
            if (typeof meal_categories === 'string') {
                try {
                    parsedCategories = JSON.parse(meal_categories);
                } catch (e) {
                    parsedCategories = [];
                }
            }
            const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
            if (Array.isArray(parsedCategories)) {
                updateData.meal_categories = parsedCategories.filter(cat => validCategories.includes(cat));
            }
        }

        if (diet_tags !== undefined) {
            let parsedDietTags = diet_tags;
            if (typeof diet_tags === 'string') {
                try {
                    parsedDietTags = JSON.parse(diet_tags);
                } catch (e) {
                    parsedDietTags = [];
                }
            }
            const cleanTags = Array.isArray(parsedDietTags) ? parsedDietTags : [];

            // Update Association
            const presets = await DietPreset.findAll({
                where: {
                    code: { [Op.in]: cleanTags }
                },
                attributes: ['id']
            });
            const presetIds = presets.map(p => p.id);
            const food = await Food.findByPk(id);
            if (food) {
                await food.setDietPresets(presetIds, { transaction });
            }
        }

        if (total_calories !== undefined) {
            updateData.calories = parseFloat(total_calories) || 0;
        }
        if (total_protein !== undefined) {
            updateData.protein = parseFloat(total_protein) || 0;
        }
        if (total_carb !== undefined) {
            updateData.carb = parseFloat(total_carb) || 0;
        }
        if (total_fat !== undefined) {
            updateData.fat = parseFloat(total_fat) || 0;
        }

        if (micronutrients !== undefined) {
            let parsedMicronutrients = {};
            if (typeof micronutrients === 'string') {
                try {
                    parsedMicronutrients = JSON.parse(micronutrients);
                } catch (e) {
                    parsedMicronutrients = {};
                }
            } else if (typeof micronutrients === 'object' && micronutrients !== null) {
                parsedMicronutrients = micronutrients;
            }
            updateData.micronutrients = parsedMicronutrients;
        }

        const [updatedRows] = await Food.update(updateData, { where: { id }, transaction });

        if (updatedRows === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Food not found or no changes made' });
        }

        if (ingredients !== undefined) {
            await FoodIngredient.destroy({ where: { food_id: id }, transaction });

            let parsedIngredients = [];
            if (typeof ingredients === 'string') {
                try {
                    parsedIngredients = JSON.parse(ingredients);
                } catch (e) {
                    parsedIngredients = [];
                }
            } else if (Array.isArray(ingredients)) {
                parsedIngredients = ingredients;
            }

            if (parsedIngredients.length > 0) {
                const ingredientsToCreate = parsedIngredients.map(ing => ({
                    food_id: id,
                    raw_food_id: ing.ingredient_id || ing.raw_food_id,
                    amount_in_grams: parseFloat(ing.amount_in_grams || ing.quantity_g || 0)
                }));
                await FoodIngredient.bulkCreate(ingredientsToCreate, { transaction });
            }
        }

        await transaction.commit();

        const updatedFood = await Food.findByPk(id, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams']
                }
            }]
        });

        res.json(updatedFood);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error updating food', error: error.message });
    }
};

// Delete Food
exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food.findByPk(id);
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        await Food.update({ status: 'deleted' }, { where: { id } });
        res.json({ message: 'Món ăn đã được xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting food', error: error.message });
    }
};

// Get Food Stats
// Get Food Stats
exports.getStats = async (req, res) => {
    try {
        const total = await Food.count({ where: { status: 'active' } });
        const inactive = await Food.count({ where: { status: 'inactive' } });

        const avgCaloriesResult = await Food.findAll({
            where: { status: 'active' },
            attributes: [[sequelize.fn('AVG', sequelize.col('calories')), 'avgCalories']],
            raw: true
        });
        const avgCalories = avgCaloriesResult[0]?.avgCalories ? Math.round(avgCaloriesResult[0].avgCalories) : 0;

        // Count by Diet Tags
        // Helper to count by diet code via association
        const countDiet = async (code) => {
            return await Food.count({
                where: { status: 'active' },
                include: [{
                    model: DietPreset,
                    as: 'dietPresets',
                    where: { code: code }
                }]
            });
        };

        // Count by Diet Tags (New approach)
        const diets = {
            keto: await countDiet('keto'),
            low_carb: await countDiet('low_carb'),
            high_protein: await countDiet('high_protein'),
            low_fat: await countDiet('low_fat'),
            balanced: await countDiet('balanced'),
            vegetarian: await countDiet('vegetarian')
        };

        // Count by Meal Categories
        const meals = {
            breakfast: await Food.count({ where: { status: 'active', meal_categories: { [Op.contains]: ['breakfast'] } } }),
            lunch: await Food.count({ where: { status: 'active', meal_categories: { [Op.contains]: ['lunch'] } } }),
            dinner: await Food.count({ where: { status: 'active', meal_categories: { [Op.contains]: ['dinner'] } } }),
            snack: await Food.count({ where: { status: 'active', meal_categories: { [Op.contains]: ['snack'] } } })
        };

        res.json({
            total,
            inactive,
            avgCalories,
            diets,
            meals
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
