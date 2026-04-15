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
  try {
    const { appointmentId, patientId, doctorId, date, timeSlot, doctorName, patientName, consultationFee } = req.body;

    const { patient, doctor } = await getDetails(patientId, doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: 'Patient or Doctor details not found for notification' });
    }

    // Send email to Patient
    if (patient.email) {
      const patientMailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: 'Appointment Booking Confirmation',
        html: `
          <h3>Booking Confirmed!</h3>
          <p>Hello ${patientName},</p>
          <p>Your appointment has been successfully booked and payment is confirmed.</p>
          <ul>
            <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${timeSlot}</li>
            <li><strong>Fee Paid:</strong> LKR ${consultationFee}</li>
          </ul>
          <p>Thank you for using our telemedicine platform!</p>
        `
      };
      await transporter.sendMail(patientMailOptions);
    }

    // Send email to Doctor
    if (doctor.email) {
      const doctorMailOptions = {
        from: process.env.EMAIL_USER,
        to: doctor.email,
        subject: 'New Appointment Booking',
        html: `
          <h3>New Appointment Confirmed!</h3>
          <p>Hello Dr. ${doctorName},</p>
          <p>A new appointment has been booked with you.</p>
          <ul>
            <li><strong>Patient:</strong> ${patientName}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${timeSlot}</li>
          </ul>
          <p>Please check your dashboard for more details.</p>
        `
      };
      await transporter.sendMail(doctorMailOptions);
    }

    res.status(200).json({ message: 'Booking notification sent successfully' });

  } catch (error) {
    console.error('Error sending booking notification:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
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
