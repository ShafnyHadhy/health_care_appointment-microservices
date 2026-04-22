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
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected to admindb');
    })
    .catch(err => console.error('MongoDB Connection Error:', err));


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
