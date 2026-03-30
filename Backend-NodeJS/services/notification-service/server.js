const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notify', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'notification-service' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
