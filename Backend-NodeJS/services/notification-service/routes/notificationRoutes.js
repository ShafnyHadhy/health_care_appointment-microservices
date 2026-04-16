const express = require('express');
const router = express.Router();
const { notifyBooking, notifyAccepted, notifyCompleted, notifyLogin } = require('../controllers/notificationController');

// In a real application, these should be protected, e.g., by internal API keys
// or using the shared JWT middleware. For simplicity in the internal network, they are public.
router.post('/booking', notifyBooking);
router.post('/accepted', notifyAccepted);
router.post('/completed', notifyCompleted);
router.post('/login', notifyLogin);

module.exports = router;
