const nodemailer = require('nodemailer');
const axios = require('axios');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to fetch details
const getDetails = async (patientId, doctorId) => {
  try {
     const pRes = await axios.get(`${process.env.PATIENT_SERVICE_URL}/api/patients`);
     const dRes = await axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors`);

     const patient = pRes.data.data.find(p => p._id === patientId);
     const doctor = dRes.data.data.find(d => d._id === doctorId);

     return { patient, doctor };
  } catch (err) {
     console.warn('Could not fetch user info for notification:', err.message);
     return { patient: null, doctor: null };
  }
};

/**
 * @desc    Send Booking Notification
 * @route   POST /api/notify/booking
 * @access  Internal
 */
const notifyBooking = async (req, res) => {
  
};

/**
 * @desc    Send Consultation Completed Notification
 * @route   POST /api/notify/completed
 * @access  Internal
 */
const notifyCompleted = async (req, res) => {
  
};

module.exports = {
  notifyBooking,
  notifyCompleted
};
