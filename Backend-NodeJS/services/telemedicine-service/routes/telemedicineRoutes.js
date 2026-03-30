const express = require('express');
const router = express.Router();
const { createSession, getSession } = require('../controllers/telemedicineController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/session/create', protect, createSession);
router.get('/session/:appointmentId', protect, getSession);

module.exports = router;
