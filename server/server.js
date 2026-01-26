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

// Require models để đảm bảo chúng được sync
require('./src/models/RawFood');
require('./src/models/Food');
require('./src/models/FoodIngredient'); // Junction table for Meal <-> RawFood relationship
require('./src/models/UserFavoriteFood'); // PB_19: Favorites
require('./src/models/UserDailyLog'); // PB_23: Diary

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/raw-foods', rawFoodRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/users', adminUsersRoutes);

// Sync DB & Start Server
// Use alter: true to update tables if models change (add columns)
sequelize.sync({ alter: true }).then(() => {
    console.log('Database connected & synced');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to database:', err);
});
