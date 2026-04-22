const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to paymentdb'))
  .catch(err => console.error('MongoDB Connection Error:', err));


app.use('/api/payment', paymentRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'payment-service' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
