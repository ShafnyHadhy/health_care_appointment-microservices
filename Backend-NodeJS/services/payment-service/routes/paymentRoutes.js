const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    handleWebhook,
    getPaymentStatus,
    verifyPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Note: Stripe Webhook needs the raw body to verify signatures. 
// We use express.raw({type: 'application/json'}) just for this route.
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    handleWebhook
);

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/status/:appointmentId', protect, getPaymentStatus);
router.get('/verify/:appointmentId', protect, verifyPayment);
router.get('/', protect, getAllPayments);
router.get('/:id', protect, getPaymentById);
router.put('/:id', protect, authorize('admin'), updatePayment);
router.delete('/:id', protect, authorize('admin'), deletePayment);

module.exports = router;
