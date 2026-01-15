const bcrypt = require('bcryptjs');
// Responding to error: Cannot find module 'mongoose'. Removing unused mongoose import.
const User = require('./src/models/User'); 
const sequelize = require('./src/config/database');
require('dotenv').config();

async function createAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const email = 'admin@healio.com';
        const password = 'adminpassword123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if exists
        const user = await User.findOne({ where: { email } });

        if (user) {
            await user.update({
                role: 'admin',
                password_hash: hashedPassword,
                status: 'active'
            });
            console.log(`Admin user updated: ${email} | Password: ${password}`);
        } else {
            await User.create({
                email,
                password_hash: hashedPassword,
                full_name: 'Super Admin',
                role: 'admin',
                status: 'active',
                auth_provider: 'local'
            });
            console.log(`Admin user created: ${email} | Password: ${password}`);
        }

    } catch (error) {
        console.error('Unable to connect to the database or create admin:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
