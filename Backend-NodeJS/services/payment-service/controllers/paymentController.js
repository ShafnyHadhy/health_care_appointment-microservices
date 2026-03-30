const Stripe = require('stripe');
const Payment = require('../models/Payment');
const axios = require('axios');

// We initialize Stripe later or inline to allow the server to start without the env var if testing locally
let stripe;
try {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
    console.warn('Stripe key not found, Stripe features will fail');
}

/**
 * @desc    Create Stripe checkout session
 * @route   POST /api/payment/create-checkout-session
 * @access  Private
 */
const createCheckoutSession = async (req, res) => {
    
};

/**
 * @desc    Handle Stripe Webhook
 * @route   POST /api/payment/webhook
 * @access  Public
 */
const handleWebhook = async (req, res) => {
    
};

/**
 * @desc    Get payment status
 * @route   GET /api/payment/status/:appointmentId
 * @access  Private
 */
const getPaymentStatus = async (req, res) => {
    
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    getPaymentStatus,
};
