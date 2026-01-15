const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const rawFoodRoutes = require('./src/routes/rawFoods');

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

// Sync DB & Start Server
// Use alter: true to update tables if models change (add columns)
sequelize.sync({ alter: true }).then(() => {
    console.log('Database connected & synced');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to database:', err);
});
