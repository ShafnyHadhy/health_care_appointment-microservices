const Appointment = require('../models/Appointment');
const axios = require('axios');

const getAxiosConfig = (req) => {
  return {
    headers: {
      Authorization: req.headers.authorization,
    },
  };
};

/**
 * @desc    Search doctors by specialty or view all
 * @route   GET /api/appointments/search
 * @access  Public
 */
const searchDoctors = async (req, res) => {

  try {

    const { specialty } = req.query;
    let url = `${process.env.DOCTOR_SERVICE_URL}/api/doctors`;

    if (specialty) {
      url += `?specialty=${encodeURIComponent(specialty)}`;
    }

    const response = await axios.get(url);

    res.status(200).json({
      message: 'Doctors fetched successfully',
      data: response.data.data
    });

  } catch (error) {
    console.error('Error fetching doctors:', error.message);
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }

};

/**
 * @desc    Book an appointment
 * @route   POST /api/appointments/book
 * @access  Private (Patient)
 */
const bookAppointment = async (req, res) => {
  
  try {

    const { doctorId, date, timeSlot, reason } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const config = getAxiosConfig(req);

    let doctorName = 'Unknown Doctor';
    let patientName = 'Unknown Patient';
    let consultationFee = 0;

    try {

      const docsRes = await axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors/`);
      const doctor = docsRes.data.data.find(d => d._id === doctorId);

      if(doctor) {
        doctorName = doctor.name;
        consultationFee = doctor.consultationFee;
      }

      const patRes = await axios.get(`${process.env.PATIENT_SERVICE_URL}/api/patients/profile`, config);
      patientName = patRes.data.data.name;

    } catch (e) {

      console.warn('Could not fetch full user details during booking', e.message);

    }

    const appointment = await Appointment.create({
      patientId,
      patientName,
      doctorId,
      doctorName,
      date,
      timeSlot,
      reason,
      consultationFee,
      status: 'pending',
      isPaid: false
    })

    // Notify user asynchronously via Notification Service

    // try {
    //   if (process.env.NOTIFICATION_SERVICE_URL) {
    //      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notify/booking`, {
    //        appointmentId: appointment._id,
    //        patientId,
    //        doctorId
    //      });
    //   }
    // } catch (notifyErr) {
    //    console.warn('Notification service failed or not implemented yet:', notifyErr.message);
    // }

    res.status(201).json({
      message: 'Appointment booked successfully', data: appointment
    })

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get user's appointments (Doctor or Patient or Admin)
 * @route   GET /api/appointments
 * @access  Private
 */
const getUserAppointments = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    console.log(`Fetching appointments for user ${userId} with role ${role}`);

    let query = {};
    if (role === 'patient') {
      query.patientId = userId;
    } else if (role === 'doctor') {
      query.doctorId = userId;
    }

    const appointments = await Appointment.find(query).sort({ date: -1 });

    res.status(200).json({
      message: 'Appointments fetched successfully',
      data: appointments
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get appointment by ID & track status
 * @route   GET /api/appointments/:id/status
 * @access  Private
 */
const getAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    res.status(200).json({
      message: 'Appointment status fetched successfully',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get available slots for a doctor on a given date
 * @route   GET /api/appointments/slots
 * @access  Public
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date required' });
    }

    const doctorRes = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors`
    );

    const doctor = doctorRes.data.data.find(d => d._id === doctorId);

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const dayName = new Date(date).toLocaleString('en-US', { weekday: 'long' });

    const dayAvailability = doctor.availability.find(a => a.day === dayName);

    if (!dayAvailability) {
      return res.json({ date, slots: [] });
    }

    const appointments = await Appointment.find({
      doctorId,
      date: new Date(date),
      status: { $ne: 'cancelled' }
    });

    const bookedSlots = appointments.map(a => a.timeSlot);

    const generateSlots = (start, end) => {
      
      const slots = [];
      let current = new Date(`1970-01-01T${start}`);

      const endTime = new Date(`1970-01-01T${end}`);

      while (current < endTime) {
        const next = new Date(current.getTime() + 30 * 60000);

        const slotString = `${current.toTimeString().slice(0,5)} - ${next.toTimeString().slice(0,5)}`;

        slots.push({
          time: slotString,
          status: bookedSlots.includes(slotString) ? 'booked' : 'available'
        });

        current = next;
      }

      return slots;
    };

    const slots = generateSlots(
      dayAvailability.startTime,
      dayAvailability.endTime
    );

    res.status(200).json({
      message: 'Slots fetched',
      date,
      slots
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

/**
 * @desc    Modify or cancel appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private 
 */
const cancelAppointment = async (req, res) => {

  try {

    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      message: 'Appointment cancelled successfully',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Admin/System update status (e.g., mark Paid from Payment Service)
 * @route   PUT /api/appointments/:id/status
 * @access  Private
 */
const updateAppointmentStatus = async (req, res) => {
  
  try {

    const appointmentId = req.params.id;
    const { status, isPaid } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (status) {
      appointment.status = status;
      // Automatically mark as paid if status is 'paid' or 'confirmed'
      if (status === 'paid' || status === 'confirmed') {
        appointment.isPaid = true;
      }
    }

    if (isPaid !== undefined) {
      appointment.isPaid = isPaid;
    }

    await appointment.save();

    // If marked as completed, trigger completion notification

    // if (status === 'completed') {
    //   try {
    //     if (process.env.NOTIFICATION_SERVICE_URL) {
    //        await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notify/completed`, {
    //          appointmentId: appointment._id,
    //          patientId: appointment.patientId,
    //          doctorId: appointment.doctorId
    //        });
    //     }
    //   } catch (notifyErr) {
    //      console.warn('Completed Notification failed/not implemented', notifyErr.message);
    //   }
    // }

    res.status(200).json({
      message: 'Appointment status updated successfully',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Special route for Payment Service webhook to hit (mark paid)
 * @route   PUT /api/appointments/:id/pay
 * @access  Public (or tightly secured via firewall/IP in production)
 */
const markPaid = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.isPaid = true;
    appointment.status = 'confirmed'; // automatically confirm when paid?
    await appointment.save();

    res.status(200).json({ message: 'Appointment marked as paid', data: appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  searchDoctors,
  bookAppointment,
  getUserAppointments,
  getAppointmentStatus,
  cancelAppointment,
  updateAppointmentStatus,
  markPaid,
  getAvailableSlots
};
