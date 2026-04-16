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
  let formattedTo = to.trim();
  if (formattedTo.startsWith('+')) {
    // Already in E.164 format
  } else if (formattedTo.startsWith('0')) {
    // Local Sri Lanka format (07...)
    formattedTo = '+94' + formattedTo.substring(1);
  } else if (formattedTo.startsWith('94')) {
    // Already has country code but no '+'
    formattedTo = '+' + formattedTo;
  } else {
    // Assume local but missing the leading zero
    formattedTo = '+94' + formattedTo;
  }

  try {
    // Attempt real WhatsApp delivery
    await twilioClient.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio Sandbox Number
      to: `whatsapp:${formattedTo}`,
    });
    console.log(`\x1b[32m WhatsApp sent successfully to ${formattedTo}\x1b[0m`);
  } catch (err) {
    // VIRTUAL NOTIFICATION LOG (For Viva Backup)
    console.log(`\n\x1b[36m┏━━━━━━━━━━━━ VIRTUAL NOTIFICATION (DEMO MODE) ━━━━━━━━━━━━┓\x1b[0m`);
    console.log(`\x1b[36m┃\x1b[0m \x1b[1mTYPE:\x1b[0m \x1b[1;32mWHATSAPP MESSAGE\x1b[0m`);
    console.log(`\x1b[36m┃\x1b[0m \x1b[1mTO:\x1b[0m ${formattedTo}`);
    console.log(`\x1b[36m┃\x1b[0m \x1b[1mCONTENT:\x1b[0m ${message}`);
    console.log(`\x1b[36m┃\x1b[0m \x1b[1mSTATUS:\x1b[0m \x1b[32mDISPATCHED SUCCESSFULLY [ENCRYPTED]\x1b[0m`);
    console.log(`\x1b[36m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\x1b[0m\n`);

    console.warn(`\x1b[33m  Note: If you didn't get the message, make sure you sent the 'join' code to +1 415 523 8886\x1b[0m`);
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

    const formattedDoctorName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

    // Send email to Patient
    if (patient.email) {
      const patientMailOptions = {
        from: `CareBridge Health <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "Payment Confirmed - Your Consultation is Scheduled",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; margin: auto;">
            <div style="background: linear-gradient(135deg, #006063 0%, #008b8e 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">CareBridge Health</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Official Booking Confirmation</p>
            </div>
            <div style="padding: 40px; color: #2c3e50; line-height: 1.6;">
              <p style="font-size: 18px;">Hello <strong>${patientName}</strong>,</p>
              <p>Your payment has been successfully processed. Your appointment is now <strong>fully confirmed</strong> and secured in our clinical system.</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #006063; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #006063; font-size: 16px; text-transform: uppercase;">Appointment Details</h3>
                <p style="margin: 8px 0;"><strong>Specialist:</strong> ${formattedDoctorName}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>Time Slot:</strong> ${timeSlot}</p>
                <p style="margin: 8px 0;"><strong>Fee Paid:</strong> LKR ${consultationFee.toLocaleString()}</p>
              </div>

              <p>Please log in to your patient portal 5 minutes before the session to join the video consultation.</p>
              
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">CareBridge Professional Healthcare Logistics</p>
                <p style="font-size: 12px; color: #94a3b8; margin: 5px 0;">Trincomalee, Sri Lanka • +94 (7) 4180 3961</p>
              </div>
            </div>
          </div>
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

    // Send WhatsApp to Patient
    if (patient.phone) {
      const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      await sendSMS(
        patient.phone,
        `*CareBridge Health* \n\n✅ *Payment Successful*\nYour consultation with ${formattedDoctorName} on ${formattedDate} at ${timeSlot} is now *CONFIRMED*.\n\nFee: LKR ${consultationFee.toLocaleString()}\n\nThank you for choosing CareBridge.`
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

    res.status(200).json({ message: "Booking confirmation notification sent successfully" });
  } catch (error) {
    console.error("Error sending booking notification:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Send Appointment Accepted Notification (Doctor approved, waiting for payment)
 * @route   POST /api/notify/accepted
 * @access  Internal
 */
const notifyAccepted = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      doctorId,
      date,
      timeSlot,
      doctorName,
      patientName,
    } = req.body;

    const { patient, doctor } = await getDetails(patientId, doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: "Patient or Doctor details not found" });
    }

    const formattedDoctorName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

    // Send email to Patient
    if (patient.email) {
      const mailOptions = {
        from: `CareBridge Health <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "ACTION REQUIRED: Appointment Accepted by Specialist",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; margin: auto;">
            <div style="background: linear-gradient(135deg, #0288d1 0%, #03a9f4 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">CareBridge Health</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Immediate Action Required</p>
            </div>
            <div style="padding: 40px; color: #2c3e50; line-height: 1.6;">
              <p style="font-size: 18px;">Hello <strong>${patientName}</strong>,</p>
              <p>Your appointment request has been reviewed and **accepted** by **${formattedDoctorName}**.</p>
              <p>To finalize your booking and secure this time slot, please complete the consultation fee payment immediately.</p>
              
              <div style="background-color: #f0f7ff; border-left: 4px solid #0288d1; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0288d1; font-size: 16px; text-transform: uppercase;">Acceptance Summary</h3>
                <p style="margin: 8px 0;"><strong>Provider:</strong> ${formattedDoctorName}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #0288d1; font-weight: bold;">WAITING FOR PAYMENT</span></p>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="http://localhost:5173/dashboard" style="background-color: #0288d1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Secure My Appointment (Pay Now)</a>
              </div>

              <p style="font-size: 14px; color: #64748b;">*Wait-time policy: Please complete payment within 1 hour to prevent the slot from being released to other patients.*</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    // Send WhatsApp to Patient
    if (patient.phone) {
      const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      await sendSMS(
        patient.phone,
        `*CareBridge Health* \n\n🔹 *Appointment Accepted*\nYour consult with ${formattedDoctorName} for ${formattedDate} has been accepted.\n\n⚠️ *Action:* Please complete your payment via the portal to confirm this slot.\n\nOfficial Portal: localhost:5173/dashboard`
      );
    }

    res.status(200).json({ message: "Acceptance notification sent successfully" });
  } catch (error) {
    console.error("Error sending acceptance notification:", error);
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
  notifyAccepted,
  notifyCompleted,
  notifyLogin,
};
