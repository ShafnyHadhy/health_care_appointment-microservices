const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const doctorRoutes = require('./routes/doctorRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to doctordb'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'doctor-service' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Doctor Service running on port ${PORT}`);
});
