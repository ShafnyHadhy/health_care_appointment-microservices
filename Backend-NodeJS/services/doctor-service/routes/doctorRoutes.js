const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
  getAllDoctors,
  verifyDoctor,
  acceptOrRejectAppointment,
  issuePrescription,
  viewPatientReports,
  getPatientPrescriptions,
  updateDoctor,
  deleteDoctor,
  getAllDoctors2
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public / Search routes
router.post('/register', registerDoctor);
router.get('/', getAllDoctors);
router.get('/appDoc', getAllDoctors2);

// Protected Doctor Profile
router.get('/profile', protect, authorize('doctor'), getDoctorProfile);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), updateAvailability);

// Protected Doctor Actions
router.put('/appointments/:id/status', protect, authorize('doctor'), acceptOrRejectAppointment);
router.post('/prescriptions', protect, authorize('doctor'), issuePrescription);
router.get('/patients/:id/reports', protect, authorize('doctor'), viewPatientReports);
router.get('/patients/:id/prescriptions', protect, getPatientPrescriptions);

// Admin Routes
router.put('/:id/verify', protect, authorize('admin'), verifyDoctor);
router.put('/:id', protect, authorize('admin'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

module.exports = router;
