const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointmentRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to appointmentdb'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/appointments', appointmentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'appointment-service' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});
