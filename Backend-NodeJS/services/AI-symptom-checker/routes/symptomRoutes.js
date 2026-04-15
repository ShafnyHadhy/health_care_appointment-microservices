const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../controllers/symptomController');

// @route   POST /api/symptoms/analyze
// @desc    Analyze symptoms and return AI predictions
// @access  Public
router.post('/analyze', analyzeSymptoms);

module.exports = router;
