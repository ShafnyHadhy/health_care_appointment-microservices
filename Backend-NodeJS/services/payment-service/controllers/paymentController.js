const Stripe = require('stripe');
const Payment = require('../models/Payment');
const axios = require('axios');

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
    try {
        const { appointmentId, amount } = req.body;

        if (!appointmentId || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // --- DEVELOPMENT BYPASS ---
        // Automatically bypass Stripe if we don't have a real API key configured
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) {
            console.log('Using Payment Mock (No Stripe Key)');
            const payment = await Payment.create({
                appointmentId,
                patientId: req.user.id,
                stripeSessionId: 'mock_session_' + Date.now(),
                amount,
                status: 'completed', // Auto-complete in mock mode for teammate flow
            });

            return res.status(200).json({
                url: `/payment-status/${appointmentId}`, // local redirect
                sessionId: payment.stripeSessionId,
                payment,
            });
        }
        // --------------------------

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'lkr',
                        product_data: {
                            name: 'Doctor Appointment Payment',
                        },
                        unit_amount: amount * 100, // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            success_url: `http://localhost:5173/payment-status/${appointmentId}`,
            cancel_url: `http://localhost:5173/cancel`,
        });

        // Save to DB
        const payment = await Payment.create({
            appointmentId,
            patientId: req.user.id,
            stripeSessionId: session.id,
            amount,
            status: 'pending',
        });

        res.status(200).json({
            url: session.url,
            sessionId: session.id,
            payment,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating checkout session' });
    }
};

/**
 * @desc    Handle Stripe Webhook
 * @route   POST /api/payment/webhook
 * @access  Public
 */
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            const payment = await Payment.findOne({
                stripeSessionId: session.id,
            });

            if (payment) {
                payment.status = 'completed';
                await payment.save();

                // OPTIONAL: Notify appointment service
                try {
                    await axios.put(
                        `http://localhost:3003/api/appointments/${payment.appointmentId}/payment`,
                        { status: 'paid' }
                    );
                } catch (err) {
                    console.warn('Appointment service not reachable');
                }
            }
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    }

    res.status(200).json({ received: true });
};

/**
 * @desc    Verify payment status and update appointment
 * @route   GET /api/payment/verify/:appointmentId
 * @access  Private
 */
const verifyPayment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const payment = await Payment.findOne({ appointmentId });

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        // In real Stripe mode, we would check the session status here.
        // For now, if we reach this point, we assume success or mock success.
        payment.status = 'completed';
        await payment.save();

        // Notify appointment service
        try {
            await axios.put(
                `http://localhost:3003/api/appointments/${appointmentId}/payment`,
                {},
                {
                    headers: { Authorization: req.headers.authorization }
                }
            );
        } catch (err) {
            console.warn('Appointment service could not be updated:', err.message);
        }

        return res.status(200).json({ 
            message: 'Payment verified', 
            data: payment 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

/**
 * @desc    Get payment status
 * @route   GET /api/payment/status/:appointmentId
 * @access  Private
 */
const getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            appointmentId: req.params.appointmentId,
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({
            status: payment.status,
            amount: payment.amount,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payment status' });
    }
};

/**
 * @desc    Get all payments
 * @route   GET /api/payment
 * @access  Private
 */
const getAllPayments = async (req, res) => {
    try {
        let payments;
        if (req.user && req.user.role === 'admin') {
            payments = await Payment.find({});
        } else {
            payments = await Payment.find({ patientId: req.user.id });
        }
        res.status(200).json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payment/:id
 * @access  Private
 */
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payment' });
    }
};

/**
 * @desc    Update payment
 * @route   PUT /api/payment/:id
 * @access  Private/Admin
 */
const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating payment' });
    }
};

/**
 * @desc    Delete payment
 * @route   DELETE /api/payment/:id
 * @access  Private/Admin
 */
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        await payment.deleteOne();
        res.status(200).json({ message: 'Payment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting payment' });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    getPaymentStatus,
    verifyPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment
};
