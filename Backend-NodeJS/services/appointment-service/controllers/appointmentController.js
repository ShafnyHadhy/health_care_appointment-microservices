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
  
};

/**
 * @desc    Get user's appointments (Doctor or Patient or Admin)
 * @route   GET /api/appointments
 * @access  Private
 */
const getUserAppointments = async (req, res) => {
  
};

/**
 * @desc    Get appointment by ID & track status
 * @route   GET /api/appointments/:id/status
 * @access  Private
 */
const getAppointmentStatus = async (req, res) => {
  
};

/**
 * @desc    Modify or cancel appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private 
 */
const cancelAppointment = async (req, res) => {
  
};

/**
 * @desc    Admin/System update status (e.g., mark Paid from Payment Service)
 * @route   PUT /api/appointments/:id/status
 * @access  Private
 */
const updateAppointmentStatus = async (req, res) => {
  
};

module.exports = {
  searchDoctors,
  bookAppointment,
  getUserAppointments,
  getAppointmentStatus,
  cancelAppointment,
  updateAppointmentStatus,
  markPaid
};
