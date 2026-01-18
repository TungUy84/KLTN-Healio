const Meal = require('../models/Meal');
const RawFood = require('../models/RawFood');
const FoodIngredient = require('../models/FoodIngredient');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// PB_51: Get List Meals with Pagination, Search and Filters
exports.getMeals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || 'created_at';
        const order = req.query.order || 'DESC';
        
        // AC2: Filters
        const mealCategory = req.query.meal_category; // Filter by meal category
        const dietTag = req.query.diet_tag; // Filter by diet tag
        const calorieMin = req.query.calorie_min ? parseFloat(req.query.calorie_min) : null;
        const calorieMax = req.query.calorie_max ? parseFloat(req.query.calorie_max) : null;
        const status = req.query.status; // Filter by status

        const where = {};
        
        // AC3: Search by name
        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }
        
        // AC2: Filter by meal category
        if (mealCategory) {
            where.meal_categories = { [Op.contains]: [mealCategory] };
        }
        
        // AC2: Filter by diet tag
        if (dietTag) {
            where.diet_tags = { [Op.contains]: [dietTag] };
        }
        
        // AC2: Filter by calorie range
        if (calorieMin !== null || calorieMax !== null) {
            where.calories = {};
            if (calorieMin !== null) {
                where.calories[Op.gte] = calorieMin;
            }
            if (calorieMax !== null) {
                where.calories[Op.lte] = calorieMax;
            }
        }
        
        // Filter by status (AC3: exclude deleted meals by default)
        if (status) {
            where.status = status;
        } else {
            // By default, don't show deleted meals
            where.status = { [Op.ne]: 'deleted' };
        }

        const offset = (page - 1) * limit;

        // Sử dụng alias "Meal" thay vì "food" vì Sequelize tạo alias này trong query
        const orderClause = [[sequelize.col(`Meal.${sort}`), order]];

        const { count, rows } = await Meal.findAndCountAll({
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

// Get Meal by ID - Updated to include ingredients (PB_52)
exports.getMealById = async (req, res) => {
    try {
        const meal = await Meal.findByPk(req.params.id, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams', 'original_unit_name', 'original_amount']
                }
            }]
        });
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }
        res.json(meal);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meal', error: error.message });
    }
};

// PB_51 + PB_54: Create Meal with Ingredients (Transaction)
exports.createMeal = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, description, meal_categories, total_calories, total_protein, total_carb, total_fat, diet_tags, status, ingredients, micronutrients } = req.body;
        
        // Parse meal_categories
        let parsedCategories = meal_categories;
        if (typeof meal_categories === 'string') {
            try {
                parsedCategories = JSON.parse(meal_categories);
            } catch (e) {
                parsedCategories = [];
            }
        }
        
        // Parse diet_tags
        let parsedDietTags = diet_tags || [];
        if (typeof diet_tags === 'string') {
            try {
                parsedDietTags = JSON.parse(diet_tags);
            } catch (e) {
                parsedDietTags = [];
            }
        }
        
        // Parse ingredients
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

        // Validate meal_categories
        const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!Array.isArray(parsedCategories)) {
            parsedCategories = [];
        }
        parsedCategories = parsedCategories.filter(cat => validCategories.includes(cat));

        // Parse micronutrients
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

        // PB_54 AC2: Create meal in FOOD table
        const newMeal = await Meal.create({
            name,
            cooking: description || '', // Map description to cooking field
            meal_categories: parsedCategories,
            calories: total_calories ? parseFloat(total_calories) : 0,
            protein: total_protein ? parseFloat(total_protein) : 0,
            carb: total_carb ? parseFloat(total_carb) : 0,
            fat: total_fat ? parseFloat(total_fat) : 0,
            status: status || 'active',
            diet_tags: Array.isArray(parsedDietTags) ? parsedDietTags : [],
            micronutrients: parsedMicronutrients,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            created_by_user_id: req.user?.id || null // From auth middleware if available
        }, { transaction });

        // PB_54 AC2: Save ingredients to food_ingredients table
        if (parsedIngredients.length > 0) {
            const ingredientsToCreate = parsedIngredients.map(ing => ({
                dish_id: newMeal.id,
                ingredient_id: ing.ingredient_id || ing.raw_food_id, // Support both old and new field names
                amount_in_grams: parseFloat(ing.amount_in_grams || ing.quantity_g || 0),
                original_unit_name: ing.original_unit_name || null,
                original_amount: ing.original_amount ? parseFloat(ing.original_amount) : null
            }));
            await FoodIngredient.bulkCreate(ingredientsToCreate, { transaction });
        }

        await transaction.commit();
        
        // Return meal with ingredients
        const mealWithIngredients = await Meal.findByPk(newMeal.id, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams', 'original_unit_name', 'original_amount']
                }
            }]
        });
        
        res.status(201).json(mealWithIngredients);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error creating meal', error: error.message });
    }
};

// PB_51 + PB_54: Update Meal with Ingredients (Transaction)
exports.updateMeal = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, description, meal_categories, total_calories, total_protein, total_carb, total_fat, diet_tags, status, ingredients, micronutrients } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.cooking = description; // Map description to cooking
        if (status) updateData.status = status;
        
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // Parse meal_categories
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
        
        // Parse diet_tags
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
        
        // Parse nutrition values
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

        // Parse micronutrients
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

        // PB_54 AC2: Update meal in FOOD table
        const [updatedRows] = await Meal.update(updateData, { where: { id }, transaction });
        
        if (updatedRows === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Meal not found or no changes made' });
        }

        // PB_54 AC2: Update ingredients in food_ingredients table
        if (ingredients !== undefined) {
            // Delete all existing ingredients
            await FoodIngredient.destroy({ where: { dish_id: id }, transaction });
            
            // Add new ingredients
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
                    dish_id: id,
                    ingredient_id: ing.ingredient_id || ing.raw_food_id,
                    amount_in_grams: parseFloat(ing.amount_in_grams || ing.quantity_g || 0),
                    original_unit_name: ing.original_unit_name || null,
                    original_amount: ing.original_amount ? parseFloat(ing.original_amount) : null
                }));
                await FoodIngredient.bulkCreate(ingredientsToCreate, { transaction });
            }
        }

        await transaction.commit();
        
        // Return updated meal with ingredients
        const updatedMeal = await Meal.findByPk(id, {
            include: [{
                model: RawFood,
                as: 'ingredients',
                through: {
                    attributes: ['amount_in_grams', 'original_unit_name', 'original_amount']
                }
            }]
        });
        
        res.json(updatedMeal);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error updating meal', error: error.message });
    }
};

// Delete Meal (Soft Delete - AC2)
exports.deleteMeal = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if meal exists
        const meal = await Meal.findByPk(id);
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }
        
        // Soft delete: Update status to 'deleted' instead of destroying
        await Meal.update({ status: 'deleted' }, { where: { id } });
        
        res.json({ message: 'Món ăn đã được xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting meal', error: error.message });
    }
};
