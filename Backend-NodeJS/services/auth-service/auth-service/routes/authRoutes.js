const express = require('express');
const router = express.Router();
const {
    register,
    login
} = require('../controllers/authController');

// Shared endpoints for all microservices to use for authentication
router.post('/register', register);
router.post('/login', login);

module.exports = router;
