const nodemailer = require("nodemailer");
const axios = require("axios");
const jwt = require("jsonwebtoken");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilio = require('twilio');

// Configure Twilio client
let twilioClient;
if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Helper to send SMS
const sendSMS = async (to, message) => {
  if (!twilioClient || !process.env.TWILIO_PHONE || !to) return;
  
  // Format number for Twilio (Ensure E.164 format)
  // Assuming Sri Lanka (+94) if it starts with 0 or has 9 digits
  let formattedTo = to.trim();
  if (formattedTo.startsWith('0')) {
    formattedTo = '+94' + formattedTo.substring(1);
  } else if (!formattedTo.startsWith('+')) {
    formattedTo = '+94' + formattedTo;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: formattedTo,
    });
    console.log(`✅ SMS sent successfully to ${formattedTo}`);
  } catch (err) {
    console.warn(`❌ Failed to send SMS to ${formattedTo}:`, err.message);
  }
};

// Helper to fetch details
const getDetails = async (patientId, doctorId) => {
  try {
    // Generate an internal system token since notifications don't have user tokens
    const token = jwt.sign(
      { userId: 'system', role: 'admin', refId: 'system' }, 
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '15m' }
    );
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const pRes = await axios.get(
      `${process.env.PATIENT_SERVICE_URL}/api/patients`,
      config
    );
    const dRes = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/appDoc`,
      config
    );

    const patientList = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.data || []);
    const doctorList = Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data || []);

    const patient = patientList.find((p) => String(p._id) === String(patientId));
    const doctor = doctorList.find((d) => String(d._id) === String(doctorId));

    return { patient, doctor };
  } catch (err) {
    console.warn("Could not fetch user info for notification:", err.message);
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
    const {
      appointmentId,
      patientId,
      doctorId,
      date,
      timeSlot,
      doctorName,
      patientName,
      consultationFee,
    } = req.body;

    const { patient, doctor } = await getDetails(patientId, doctorId);

    if (!patient || !doctor) {
      return res
        .status(404)
        .json({
          message: "Patient or Doctor details not found for notification",
        });
    }

    // Send email to Patient
    if (patient.email) {
      const patientMailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: "Appointment Booking Confirmation",
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
        `,
      };
      await transporter.sendMail(patientMailOptions);
    }

    // Send email to Doctor
    if (doctor.email) {
      const doctorMailOptions = {
        from: process.env.EMAIL_USER,
        to: doctor.email,
        subject: "New Appointment Booking",
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
        `,
      };
      await transporter.sendMail(doctorMailOptions);
    }

    // Send SMS to Patient
    if (patient.phone) {
      await sendSMS(
        patient.phone,
        `Your appointment with Dr. ${doctorName} on ${new Date(date).toLocaleDateString()} at ${timeSlot} is confirmed. Fee: LKR ${consultationFee}.`
      );
    }

    // Send SMS to Doctor (Disabled for demo to avoid trial account 'unverified' errors)
    /*
    if (doctor.phone) {
      await sendSMS(
        doctor.phone,
        `New appointment booked with patient ${patientName} on ${new Date(date).toLocaleDateString()} at ${timeSlot}.`
      );
    }
    */

    res.status(200).json({ message: "Booking notification sent successfully" });
  } catch (error) {
    console.error("Error sending booking notification:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Send Consultation Completed Notification
 * @route   POST /api/notify/completed
 * @access  Internal
 */

/**
 * @desc    Send Consultation Completed Notification
 * @route   POST /api/notify/completed
 * @access  Internal
 */
const notifyCompleted = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      doctorId,
      date,
      timeSlot,
      doctorName,
      patientName,
      prescriptionLink,
    } = req.body;

    const { patient, doctor } = await getDetails(patientId, doctorId);

    if (!patient || !doctor) {
      return res
        .status(404)
        .json({
          message: "Patient or Doctor details not found for notification",
        });
    }

    // Send email to Patient
    if (patient.email) {
      const patientMailOptions = {
        from: process.env.EMAIL_USER,
        to: patient.email,
        subject: "Consultation Completed",
        html: `
          <h3>Consultation Completed</h3>
          <p>Hello ${patientName},</p>
          <p>Your consultation with Dr. ${doctorName} has been completed.</p>
          <ul>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${timeSlot}</li>
          </ul>
          ${prescriptionLink ? `<p>Your prescription: <a href="${prescriptionLink}">View Prescription</a></p>` : ""}
          <p>Thank you for using our telemedicine platform!</p>
        `,
      };
      await transporter.sendMail(patientMailOptions);
    }

    // Send email to Doctor
    if (doctor.email) {
      const doctorMailOptions = {
        from: process.env.EMAIL_USER,
        to: doctor.email,
        subject: "Consultation Completed",
        html: `
          <h3>Consultation Completed</h3>
          <p>Hello Dr. ${doctorName},</p>
          <p>Your consultation with patient ${patientName} has been completed.</p>
          <ul>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${timeSlot}</li>
          </ul>
          <p>Please check your dashboard for more details.</p>
        `,
      };
      await transporter.sendMail(doctorMailOptions);
    }

    // Send SMS to Patient
    if (patient.phone) {
      await sendSMS(
        patient.phone,
        `Your consultation with Dr. ${doctorName} on ${new Date(date).toLocaleDateString()} at ${timeSlot} has been completed.`
      );
    }

    // Send SMS to Doctor (Disabled for demo to avoid trial account 'unverified' errors)
    /*
    if (doctor.phone) {
      await sendSMS(
        doctor.phone,
        `Your consultation with patient ${patientName} on ${new Date(date).toLocaleDateString()} at ${timeSlot} has been completed.`
      );
    }
    */

    res
      .status(200)
      .json({
        message: "Consultation completion notification sent successfully",
      });
  } catch (error) {
    console.error("Error sending consultation completion notification:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Send Login Notification
 * @route   POST /api/notify/login
 * @access  Internal
 */
const notifyLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required for login notification" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Security Alert: Successful Login",
      html: `
        <h3>Responsive Alert: Login Successful</h3>
        <p>Hello,</p>
        <p>We noticed a successful login to your account recently.</p>
        <p>Date & Time: ${new Date().toLocaleString()}</p>
        <p>If this was you, you can ignore this email. If this wasn't you, please secure your account immediately.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    // Optional: send SMS if they eventually pass the phone number here
    // For now we just send the email

    res.status(200).json({ message: "Login notification sent successfully" });
  } catch (error) {
    console.error("Error sending login notification:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  notifyBooking,
  notifyCompleted,
  notifyLogin,
};
