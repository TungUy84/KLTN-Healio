const Food = require('../models/Food');
const RawFood = require('../models/RawFood');
const FoodIngredient = require('../models/FoodIngredient');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

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
        
        if (dietTag) {
            where.diet_tags = { [Op.contains]: [dietTag] };
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
            order: orderClause,
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
        const food = await Food.findByPk(req.params.id, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams']
                }
            }]
        });
        if (!food) {
            return res.status(404).json({ message: 'Food not found' });
        }
        res.json(food);
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

        const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!Array.isArray(parsedCategories)) {
            parsedCategories = [];
        }
        parsedCategories = parsedCategories.filter(cat => validCategories.includes(cat));

        let parsedMicronutrients = {};
        if (micronutrients) {
            if (typeof micronutrients === 'string') {
                try {
                    parsedMicronutrients = JSON.parse(micronutrients);
                } catch (e) {
                    parsedMicronutrients = {};
                }
            } else if (typeof micronutrients === 'object' && micronutrients !== null) {
                parsedMicronutrients = micronutrients;
            }
        }

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
            diet_tags: Array.isArray(parsedDietTags) ? parsedDietTags : [],
            micronutrients: parsedMicronutrients,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            created_by_user_id: req.user?.id || null 
        }, { transaction });

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
            updateData.diet_tags = Array.isArray(parsedDietTags) ? parsedDietTags : [];
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
