const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
    registerPatient,
    getPatientProfile,
    updatePatientProfile,
    getAllPatients,
    uploadReport,
    getReports,
    deleteReport,
    getMyPrescriptions
} = require('../controllers/patientController');

// Public routes
router.post('/register', registerPatient);
router.get('/', getAllPatients); // Typically protected for admin only, public/admin here

// Protected routes (Patient Profile)
router.get('/profile', protect, getPatientProfile);
router.put('/profile', protect, updatePatientProfile);
router.get('/prescriptions', protect, authorize('patient'), getMyPrescriptions);

// Protected routes (Medical Reports)
// We specifically only let the 'patient' upload to their own record here
router.post('/reports/upload', protect, authorize('patient'), upload.single('report'), uploadReport);
router.get('/reports', protect, authorize('patient'), getReports);
router.delete('/reports/:filename', protect, authorize('patient'), deleteReport);

module.exports = router;
