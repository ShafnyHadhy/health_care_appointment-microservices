const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected to admindb');
        await seedAdmin();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Initial seed function for the first admin user
const seedAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            console.log('No admin found. Seeding initial admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await Admin.create({
                name: 'System Admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user seeded successfully. (admin@example.com / admin123)');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};


// Routes
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'admin-service' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Admin Service running on port ${PORT}`);
});
