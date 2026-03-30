const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Admin = require('../models/Admin');

dotenv.config({ path: '../.env' }); // Make sure it reads the correct env file

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/admindb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const existingAdmin = await Admin.findOne({ email: 'admin@system.local' });
        if (existingAdmin) {
            console.log('Admin already exists. Run successful.');
            process.exit();
        }

        const admin = await Admin.create({
            name: 'System Admin',
            email: 'admin@system.local',
            password: 'securepassword123',
            role: 'admin'
        });

        console.log('Admin created in admindb.');

        try {
            await axios.post('http://localhost:3008/api/auth/register', {
                email: admin.email,
                password: 'securepassword123',
                role: 'admin',
                refId: admin._id
            });
            console.log('Admin synced with auth-service successfully!');
        } catch (error) {
            console.error('Failed to sync with auth-service:', error.message);
            await Admin.findByIdAndDelete(admin._id);
            process.exit(1);
        }

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedAdmin();
