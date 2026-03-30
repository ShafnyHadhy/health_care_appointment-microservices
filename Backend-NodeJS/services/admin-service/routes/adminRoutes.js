const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    getAllUsers,
    getAllAppointments,
    verifyDoctor,
    getDashboardCounts
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protected Admin routes
// Apply protect and authorize('admin') to all routes below this middleware
router.use(protect);
router.use(authorize('admin'));

router.post('/register', registerAdmin);
router.get('/users', getAllUsers);
router.get('/appointments', getAllAppointments);
router.put('/doctors/verify/:id', verifyDoctor);
router.get('/dashboard', getDashboardCounts);

module.exports = router;