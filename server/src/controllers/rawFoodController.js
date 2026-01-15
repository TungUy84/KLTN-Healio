const RawFood = require('../models/RawFood');
const csv = require('csv-parser');
const fs = require('fs');
const { Op } = require('sequelize');

// PB_44: Get List Raw Foods with Pagination and Search
exports.getRawFoods = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'DESC';

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } }, // Postgres use iLike for case-insensitive
                { code: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await RawFood.findAndCountAll({
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
        res.status(500).json({ message: 'Error fetching raw foods', error: error.message });
    }
};

// PB_45: Get Detail
exports.getRawFoodById = async (req, res) => {
    try {
        const food = await RawFood.findByPk(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Raw food not found' });
        }
        res.json(food);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching raw food detail', error: error.message });
    }
};

// PB_46: Create Raw Food Manual
exports.createRawFood = async (req, res) => {
    try {
        const { code, name, unit, energy_kcal, protein_g, fat_g, carb_g, fiber_g, micronutrients, description } = req.body;
        
        // Check duplicate code
        const existing = await RawFood.findOne({ where: { code } });
        if (existing) {
            return res.status(400).json({ message: 'Mã nguyên liệu (Code) đã tồn tại.' });
        }

        // Parse micronutrients if it comes as string from form-data
        let parsedMicronutrients = micronutrients;
        if (typeof micronutrients === 'string') {
            try {
                parsedMicronutrients = JSON.parse(micronutrients);
            } catch (e) {
                parsedMicronutrients = {};
            }
        }

        const newFood = await RawFood.create({
            code,
            name,
            unit,
            energy_kcal,
            protein_g,
            fat_g,
            carb_g,
            fiber_g,
            micronutrients: parsedMicronutrients,
            description,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        res.status(201).json(newFood);
    } catch (error) {
        res.status(500).json({ message: 'Error creating raw food', error: error.message });
    }
};

// PB_46: Update Raw Food
exports.updateRawFood = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // Parse micronutrients if sent as string (from FormData)
        if (typeof updateData.micronutrients === 'string') {
            try {
                updateData.micronutrients = JSON.parse(updateData.micronutrients);
            } catch (e) {
                // Keep as is or invalid
            }
        }

        const [updatedRows] = await RawFood.update(updateData, { where: { id } });
        
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Raw food not found or no changes made' });
        }

        const updatedFood = await RawFood.findByPk(id);
        res.json(updatedFood);
    } catch (error) {
        res.status(500).json({ message: 'Error updating raw food', error: error.message });
    }
};

exports.deleteRawFood = async (req, res) => {
    try {
        const deleted = await RawFood.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Raw food not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting raw food', error: error.message });
    }
};

// PB_47: Import CSV/Excel
exports.importRawFoods = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên file CSV.' });
    }

    const mode = req.body.mode || 'skip'; // 'skip' or 'overwrite'
    const results = [];
    const errors = [];
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const fixedColumns = ['Code', 'Name', 'Unit', 'Energy_Kcal', 'Protein_g', 'Fat_g', 'Carb_g', 'Fiber_g', 'Description', 'Image'];

    // Helper to clean BOM and whitespace from headers
    const cleanHeader = (header) => {
        return header.trim().replace(/^\ufeff/, '');
    };

    fs.createReadStream(req.file.path)
        .pipe(csv({
            mapHeaders: ({ header }) => cleanHeader(header)
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`[Import] Total rows parsed: ${results.length}`);
            if (results.length > 0) {
                console.log('[Import] First row keys:', Object.keys(results[0]));
            }

            // Remove temp file
            try {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            } catch(e) { console.error("Error deleting file", e); }

            for (const row of results) {
                try {
                    const code = row.Code;
                    if (!code) {
                        errors.push({ row: row, error: 'Missing Code' });
                        continue;
                    }

                    // Extract Fixed Data
                    const foodData = {
                        code: code,
                        name: row.Name,
                        unit: row.Unit || '100g',
                        energy_kcal: parseFloat(row.Energy_Kcal) || 0,
                        protein_g: parseFloat(row.Protein_g) || 0,
                        fat_g: parseFloat(row.Fat_g) || 0,
                        carb_g: parseFloat(row.Carb_g) || 0,
                        fiber_g: parseFloat(row.Fiber_g) || 0,
                        micronutrients: {}
                    };

                    // Extract Micronutrients (Dynamic Columns)
                    Object.keys(row).forEach(key => {
                        if (!fixedColumns.includes(key)) {
                            const val = row[key];
                            if (val !== '' && val !== null && val !== undefined) {
                                foodData.micronutrients[key] = val;
                            }
                        }
                    });

                    // Check existence
                    const existing = await RawFood.findOne({ where: { code } });

                    if (existing) {
                        if (mode === 'overwrite') {
                            await RawFood.update(foodData, { where: { id: existing.id } });
                            updatedCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        await RawFood.create(foodData);
                        addedCount++;
                    }

                } catch (err) {
                    errors.push({ row: row, error: err.message });
                }
            }

            res.json({
                message: 'Import hoàn tất.',
                stats: {
                    total: results.length,
                    added: addedCount,
                    updated: updatedCount,
                    skipped: skippedCount,
                    errors: errors.length
                },
                errorDetails: errors
            });
        });
};
