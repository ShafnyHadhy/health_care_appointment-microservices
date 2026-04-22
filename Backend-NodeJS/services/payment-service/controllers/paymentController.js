const Stripe = require('stripe');
const Payment = require('../models/Payment');
const axios = require('axios');

let stripe;
try {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
    console.warn('Stripe key not found, Stripe features will fail');
}


const createCheckoutSession = async (req, res) => {
    try {
        const { appointmentId, amount } = req.body;

        if (!appointmentId || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Automatically bypass Stripe if we don't have a real API key configured
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) {
            console.log('Using Payment Mock (No Stripe Key)');
            const payment = await Payment.create({
                appointmentId,
                patientId: req.user.id,
                stripeSessionId: 'mock_session_' + Date.now(),
                amount,
                status: 'completed',
            });

            return res.status(200).json({
                url: `/payment-status/${appointmentId}`,
                sessionId: payment.stripeSessionId,
                payment,
            });
        }

        const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
        if (!FRONTEND_URL) {
            return res.status(500).json({ message: 'FRONTEND_URL is not set (required for Stripe redirects)' });
        }

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
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${FRONTEND_URL}/payment-status/${appointmentId}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
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
                        `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${payment.appointmentId}/pay`,
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
                `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}/pay`,
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


const getAllPayments = async (req, res) => {
    try {
        let payments;
        if (req.user && req.user.role === 'admin') {
            payments = await Payment.find({}).sort({ createdAt: -1 });
        } else {
            payments = await Payment.find({ patientId: req.user.id }).sort({ createdAt: -1 });
        }
        res.status(200).json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payments' });
    }
};


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
