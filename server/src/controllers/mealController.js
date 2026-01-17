const Meal = require('../models/Meal');
const { Op } = require('sequelize');

// PB_51: Get List Meals with Pagination, Search and Filters
exports.getMeals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || 'createdAt';
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
            where.total_calories = {};
            if (calorieMin !== null) {
                where.total_calories[Op.gte] = calorieMin;
            }
            if (calorieMax !== null) {
                where.total_calories[Op.lte] = calorieMax;
            }
        }
        
        // Filter by status
        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Meal.findAndCountAll({
            where,
            order: [[sort, order]],
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
        res.status(500).json({ message: 'Error fetching meals', error: error.message });
    }
};

// Get Meal by ID
exports.getMealById = async (req, res) => {
    try {
        const meal = await Meal.findByPk(req.params.id);
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }
        res.json(meal);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meal', error: error.message });
    }
};

// PB_51: Create Meal
exports.createMeal = async (req, res) => {
    try {
        const { name, description, meal_categories, total_calories, status } = req.body;
        
        // Parse meal_categories if it comes as string from form-data
        let parsedCategories = meal_categories;
        if (typeof meal_categories === 'string') {
            try {
                parsedCategories = JSON.parse(meal_categories);
            } catch (e) {
                parsedCategories = [];
            }
        }

        // Validate meal_categories
        const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!Array.isArray(parsedCategories)) {
            parsedCategories = [];
        }
        parsedCategories = parsedCategories.filter(cat => validCategories.includes(cat));

        const newMeal = await Meal.create({
            name,
            description: description || '',
            meal_categories: parsedCategories,
            total_calories: total_calories ? parseFloat(total_calories) : 0,
            status: status || 'active',
            diet_tags: [], // Will be auto-calculated later based on macro ratios
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        res.status(201).json(newMeal);
    } catch (error) {
        res.status(500).json({ message: 'Error creating meal', error: error.message });
    }
};

// Update Meal
exports.updateMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // Parse meal_categories if sent as string
        if (updateData.meal_categories && typeof updateData.meal_categories === 'string') {
            try {
                updateData.meal_categories = JSON.parse(updateData.meal_categories);
            } catch (e) {
                // Keep as is
            }
        }

        // Validate meal_categories
        if (Array.isArray(updateData.meal_categories)) {
            const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
            updateData.meal_categories = updateData.meal_categories.filter(cat => validCategories.includes(cat));
        }
        
        // Parse total_calories if sent as string
        if (updateData.total_calories !== undefined) {
            updateData.total_calories = parseFloat(updateData.total_calories) || 0;
        }

        const [updatedRows] = await Meal.update(updateData, { where: { id } });
        
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Meal not found or no changes made' });
        }

        const updatedMeal = await Meal.findByPk(id);
        res.json(updatedMeal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating meal', error: error.message });
    }
};

// Delete Meal
exports.deleteMeal = async (req, res) => {
    try {
        const deleted = await Meal.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Meal not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting meal', error: error.message });
    }
};
