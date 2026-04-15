const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Diagnostic Logging
app.use((req, res, next) => {
    console.log(`[AI SERVICE] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
const symptomRoutes = require('./routes/symptomRoutes');
app.use('/api/symptoms', symptomRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'ai-symptom-checker' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3009;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Symptom Checker Service running on port ${PORT}`);
});
