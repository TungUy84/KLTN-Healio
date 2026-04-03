const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const rawFoodRoutes = require('./src/routes/rawFoods');
const foodRoutes = require('./src/routes/foods');
const dashboardRoutes = require('./src/routes/dashboard');
const adminUsersRoutes = require('./src/routes/adminUsers');
const statsRoutes = require('./src/routes/stats');
const aiRoutes = require('./src/routes/ai');
const dietRoutes = require('./src/routes/diet');
const { seedDietPresets } = require('./src/controllers/userController');

// Require models để đảm bảo chúng được sync
require('./src/models/RawFood');
require('./src/models/Food');
require('./src/models/FoodIngredient');
require('./src/models/UserProfile');
require('./src/models/UserNutritionTarget');
require('./src/models/DietPreset');
require('./src/models/UserFavoriteFood');
require('./src/models/UserDailyLog');
require('./src/models/UserWeightLog');
require('./src/models/FoodDietPreset');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve uploads folder with Auto-Fix for mangled Vietnamese filenames (Multer Latin1 issue)
const fs = require('fs');
const path = require('path');
app.use('/uploads', (req, res, next) => {
    try {
        const decoded = decodeURIComponent(req.url);
        const originalPath = path.join(__dirname, 'uploads', decoded);
        if (!fs.existsSync(originalPath)) {
            // Translate real UTF-8 "Bánh" into Multer's mangled Latin-1 "BÃ¡nh"
            const mangled = Buffer.from(decoded, 'utf8').toString('latin1');
            req.url = encodeURI(mangled);
        }
    } catch(err) {}
    next();
});
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/raw-foods', rawFoodRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/diets', dietRoutes);

// Sync DB & Start Server
// Use alter: true to update tables if models change (add columns)
sequelize.sync({ alter: true }).then(() => {
    console.log('Database connected & synced');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', async () => {
        console.log(`Server running on port ${PORT}`);
        await seedDietPresets();
    });
}).catch(err => {
    console.error('Unable to connect to database:', err);
});
