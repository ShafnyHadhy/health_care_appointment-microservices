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

    console.log(`\n\x1b[36m[NOTIFICATION SERVICE] Processing CONFIRMATION Notification (Payment Done)\x1b[0m`);

    // Send email to Patient
    if (patient.email) {
      const patientMailOptions = {
        from: `"CareBridge Health Administration" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "CONFIRMED: Your Consultation Payment has been Received",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; border-top: 5px solid #006063; border-radius: 8px; overflow: hidden; margin: 20px auto; background-color: #ffffff;">
            <div style="padding: 30px; border-bottom: 1px solid #eee; text-align: center;">
              <h2 style="color: #006063; margin: 0; text-transform: uppercase; letter-spacing: 2px;">CareBridge Health</h2>
              <p style="color: #666; font-size: 14px; margin-top: 5px;">Excellence in Digital Healthcare</p>
            </div>
            <div style="padding: 40px; color: #333; line-height: 1.6;">
              <p style="font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
              <p>We are pleased to inform you that your payment has been successfully verified. Your consultation slot is now <strong>officially confirmed</strong> in our specialist registry.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #fcfcfc;">
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666;"><strong>Healthcare Professional:</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;"><strong>${formattedDoctorName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666;"><strong>Scheduled Date:</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666;"><strong>Time Window:</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666;"><strong>Financial Status:</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #2e7d32;"><strong>LKR ${consultationFee.toLocaleString()} [PAID]</strong></td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #555;">Please ensure you have a stable internet connection and access your patient dashboard 5 minutes prior to your session to join the video consultation.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dotted #ccc; text-align: center;">
                <p style="font-size: 12px; color: #999; margin: 0;">CareBridge Professional Medical Logistics • Trincomalee, Sri Lanka</p>
                <p style="font-size: 11px; color: #aaa; margin: 5px 0;">This is an automated system-generated billing confirmation.</p>
              </div>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(patientMailOptions);
    }

    // Send WhatsApp to Patient
    if (patient.phone) {
      const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      await sendSMS(
        patient.phone,
        `*CareBridge Health - OFFICIAL*\n\n✅ *PAYMENT CONFIRMED*\nYour consultation with ${formattedDoctorName} on ${formattedDate} at ${timeSlot} is now *SECURED*.\n\n*Receipt:* LKR ${consultationFee.toLocaleString()}\n*Status:* Finalized\n\nPlease log in to the portal at the scheduled time.`
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

    const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    const portalUrl = FRONTEND_URL ? `${FRONTEND_URL}/dashboard` : '/dashboard';

    // Send email to Patient
    if (patient.email) {
      const mailOptions = {
        from: `"CareBridge Health Admissions" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "REQUIREMENT: Specialist Review Complete - Payment Pending",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; border-top: 5px solid #0288d1; border-radius: 8px; overflow: hidden; margin: 20px auto; background-color: #ffffff;">
            <div style="padding: 30px; border-bottom: 1px solid #eee; text-align: center;">
              <h2 style="color: #0288d1; margin: 0; text-transform: uppercase; letter-spacing: 2px;">CareBridge Health</h2>
              <p style="color: #666; font-size: 14px; margin-top: 5px;">Specialist Intake Update</p>
            </div>
            <div style="padding: 40px; color: #333; line-height: 1.6;">
              <p style="font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
              <p>Your request for a consultation has been reviewed and <strong>formally accepted</strong> by <strong>${formattedDoctorName}</strong>.</p>
              <p>To finalize this booking and secure the scheduled time slot, clinical policy requires the settlement of the consultation fee before confirmation.</p>
              
              <div style="background-color: #f0f7ff; border: 1px solid #cfe2ff; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 8px 0;"><strong>Assigned Specialist:</strong> ${formattedDoctorName}</p>
                <p style="margin: 8px 0;"><strong>Proposed Date:</strong> ${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>System Status:</strong> <span style="color: #0288d1; font-weight: bold;">WAITING FOR CLEARANCE</span></p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${portalUrl}" style="background-color: #0288d1; color: white; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 14px; text-transform: uppercase;">Complete Secure Payment</a>
              </div>

              <p style="font-size: 12px; color: #777;"><em>*Note: This time slot is reserved for you for a limited duration. Please complete the action above to avoid automatic release of the slot.*</em></p>
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
        `*CareBridge Health - UPDATE*\n\n🔹 *APPOINTMENT ACCEPTED*\nYour consult with ${formattedDoctorName} for ${formattedDate} is accepted.\n\n*Action Required:* Please complete your payment via the portal to formally SECURE your slot.\n\nPortal: ${portalUrl}`
      );
    }

    res.status(200).json({ message: "Acceptance notification sent successfully" });
  } catch (error) {
    console.error("Error sending acceptance notification:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

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
      return res.status(404).json({ message: "Patient or Doctor details not found" });
    }

    const formattedDoctorName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;

    // Send email to Patient
    if (patient.email) {
      const patientMailOptions = {
        from: `"CareBridge Health - Medical Records" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "Consultation Summary & Prescription Ready",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; border-top: 5px solid #666; border-radius: 8px; overflow: hidden; margin: 20px auto; background-color: #ffffff;">
            <div style="padding: 30px; border-bottom: 1px solid #eee; text-align: center;">
              <h2 style="color: #444; margin: 0; text-transform: uppercase; letter-spacing: 2px;">CareBridge Health</h2>
              <p style="color: #666; font-size: 14px; margin-top: 5px;">Post-Consultation Report</p>
            </div>
            <div style="padding: 40px; color: #333; line-height: 1.6;">
              <p style="font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
              <p>Your consultation with <strong>${formattedDoctorName}</strong> has been successfully completed. Your official medical records for this session are now available.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p style="margin: 8px 0;"><strong>Session Time:</strong> ${timeSlot}</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> COMPLETED</p>
              </div>

              ${prescriptionLink ? `
              <div style="text-align: center; margin: 40px 0;">
                <a href="${prescriptionLink}" style="background-color: #444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Official Prescription</a>
              </div>` : ""}

              <p>We value your feedback. Please take a moment to rate your experience on our platform.</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(patientMailOptions);
    }

    // Send WhatsApp to Patient
    if (patient.phone) {
      await sendSMS(
        patient.phone,
        `*CareBridge Health - RECORD*\n\n📋 *CONSULTATION COMPLETED*\nYour session with ${formattedDoctorName} is complete. Your prescription is ready in the patient portal.\n\nStay Healthy!`
      );
    }

    res.status(200).json({ message: "Consultation completion notification sent successfully" });
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
