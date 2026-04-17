const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const Admin = require('../models/Admin');

dotenv.config({ path: '../.env' }); // Make sure it reads the correct env file

const base = (u) => (u || '').replace(/\/$/, '');
const requireEnv = (name) => {
    const v = process.env[name];
    if (!v) throw new Error(`${name} is not set`);
    return v;
};

const seedAdmin = async () => {
    try {
        await mongoose.connect(requireEnv('MONGO_URI'), {
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
            const AUTH_SERVICE_URL = base(requireEnv('AUTH_SERVICE_URL'));
            await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
                email: admin.email,
                password: 'securepassword123',
                role: 'admin',
                refId: admin._id
            });
            console.log('Admin synced with auth-service successfully!');
        } catch (error) {
            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error('Failed to sync with auth-service:', errorMsg);
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
