const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const axios = require('axios');

const getAxiosConfig = (req) => {
  return {
    headers: {
      Authorization: req.headers.authorization,
    },
  };
};

/**
 * @desc    Register a new doctor
 * @route   POST /api/doctors/register
 * @access  Public
 */
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialty, phone } = req.body;

    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialty,
      phone,
      role: 'doctor',
    });

    if (doctor) {
      try {
        await axios.post('http://localhost:3008/api/auth/register', {
            email: doctor.email,
            password: req.body.password,
            role: 'doctor',
            refId: doctor._id
        });
      } catch (authError) {
        await Doctor.findByIdAndDelete(doctor._id);
        return res.status(500).json({ message: 'Failed to create auth credentials', error: authError.message });
      }

      res.status(201).json({
        message: 'Doctor registered successfully. Awaiting verification.',
        data: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          role: doctor.role,
          isVerified: doctor.isVerified,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid doctor data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Server', error: error.message });
  }
};



/**
 * @desc    Get doctor profile
 * @route   GET /api/doctors/profile
 * @access  Private (Doctor)
 */
const getDoctorProfile = async (req, res) => {
  
};

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/profile
 * @access  Private (Doctor)
 */
const updateDoctorProfile = async (req, res) => {
  
};

/**
 * @desc    Set Availability
 * @route   PUT /api/doctors/availability
 * @access  Private (Doctor)
 */
const updateAvailability = async (req, res) => {
   
};

/**
 * @desc    Get all doctors (For search & admin)
 * @route   GET /api/doctors
 * @access  Public / Admin
 */
const getAllDoctors = async (req, res) => {
  
};

/**
 * @desc    Verify a doctor
 * @route   PUT /api/doctors/:id/verify
 * @access  Private (Admin only)
 */
const verifyDoctor = async (req, res) => {
  
};

/**
 * @desc    Accept or reject an appointment
 * @route   PUT /api/doctors/appointments/:id/status
 * @access  Private (Doctor)
 */
const acceptOrRejectAppointment = async (req, res) => {
  
};

/**
 * @desc    Issue a digital prescription
 * @route   POST /api/doctors/prescriptions
 * @access  Private (Doctor)
 */
const issuePrescription = async (req, res) => {
   try {
     const { patientId, appointmentId, medications, notes } = req.body;
     
     if (!patientId || !medications || medications.length === 0) {
       return res.status(400).json({ message: 'Patient ID and at least one medication required' });
     }

     const prescription = await Prescription.create({
       doctorId: req.user.id,
       patientId,
       appointmentId,
       medications,
       notes
     });

     res.status(201).json({ message: 'Prescription issued successfully', data: prescription });
   } catch (error) {
     res.status(500).json({ message: 'Server Error', error: error.message });
   }
};

/**
 * @desc    View patient medical reports
 * @route   GET /api/doctors/patients/:id/reports
 * @access  Private (Doctor)
 */
const viewPatientReports = async (req, res) => {
  
};

/**
 * @desc    Get prescriptions for a specific patient
 * @route   GET /api/doctors/patients/:id/prescriptions
 * @access  Private (Doctor or Patient)
 */
const getPatientPrescriptions = async (req, res) => {
  
};

module.exports = {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
  getAllDoctors,
  verifyDoctor,
  acceptOrRejectAppointment,
  issuePrescription,
  viewPatientReports,
  getPatientPrescriptions
};
