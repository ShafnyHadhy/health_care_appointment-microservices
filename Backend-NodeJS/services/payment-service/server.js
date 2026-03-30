const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());

// Webhook needs raw body, not JSON. It's handled in the routes/paymentRoutes.js
// For all other routes, use JSON parser
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to paymentdb'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/payment', paymentRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'payment-service' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
