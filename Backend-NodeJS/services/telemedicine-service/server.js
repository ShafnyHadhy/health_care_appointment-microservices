const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const telemedicineRoutes = require('./routes/telemedicineRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to telemedicinedb'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/telemedicine', telemedicineRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'telemedicine-service' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
    console.log(`Telemedicine Service running on port ${PORT}`);
});
