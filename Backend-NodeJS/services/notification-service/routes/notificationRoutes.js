const express = require('express');
const router = express.Router();
const { notifyBooking, notifyCompleted } = require('../controllers/notificationController');

// In a real application, these should be protected, e.g., by internal API keys
// or using the shared JWT middleware. For simplicity in the internal network, they are public.
router.post('/booking', notifyBooking);
router.post('/completed', notifyCompleted);

module.exports = router;
