const express = require('express');
const router = express.Router();
const {
  searchDoctors,
  bookAppointment,
  getUserAppointments,
  getAppointmentStatus,
  cancelAppointment,
  updateAppointmentStatus,
  markPaid,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// Public route to search doctors (it just forwards to doctor service conceptually)
router.get('/search', searchDoctors);

// New route to fetch available slots for a doctor on a specific date
router.get('/slots', getAvailableSlots);

// Internal/Webhook route for payment completion
router.put('/:id/payment', markPaid); 

// Protected routes
router.use(protect);

router.post('/book', authorize('patient'), bookAppointment);
router.get('/', getUserAppointments);
router.get('/:id/status', getAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);

// Anyone verified via JWT (like Doctor or Admin) can update status
// Doctor service calls this internally to Accept/Reject
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
