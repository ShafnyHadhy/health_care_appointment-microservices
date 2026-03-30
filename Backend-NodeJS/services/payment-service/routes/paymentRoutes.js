const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    handleWebhook,
    getPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Note: Stripe Webhook needs the raw body to verify signatures. 
// We use express.raw({type: 'application/json'}) just for this route.
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    handleWebhook
);

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/status/:appointmentId', protect, getPaymentStatus);

module.exports = router;
