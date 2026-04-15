const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    getAllUsers,
    getAllAppointments,
    verifyDoctor,
    getDashboardCounts,
    deleteUser,
    updateUser,
    rejectDoctor
} = require('../controllers/adminController');
const {
    getSearchSuggestions,
    getPredictiveAnalytics,
    getRoles,
    createRole,
    getGamificationData,
    awardPoints,
    getNotifications,
    markNotificationRead,
    chatbotAssistant
} = require('../controllers/adminActionController');
const { saveAiReport, getAiReports } = require('../controllers/aiReportController');
const { protect, authorize } = require('../middleware/auth');

// Public route for AI Reports (called by Symptom Checker)
router.post('/ai-reports/public', saveAiReport);

// Protected Admin routes
router.use(protect);
router.use(authorize('admin'));

router.post('/register', registerAdmin);
router.get('/users', getAllUsers);
router.delete('/users/:type/:id', deleteUser);
router.put('/users/:type/:id', updateUser);

router.get('/appointments', getAllAppointments);
router.put('/doctors/verify/:id', verifyDoctor);
router.put('/doctors/reject/:id', rejectDoctor);
router.get('/dashboard', getDashboardCounts);

// Innovative Features Routes
router.get('/actions/search-suggestions', getSearchSuggestions);
router.get('/actions/analytics', getPredictiveAnalytics);
router.get('/actions/roles', getRoles);
router.post('/actions/roles', createRole);
router.get('/actions/gamification', getGamificationData);
router.post('/actions/gamification/award', awardPoints);
router.get('/actions/notifications', getNotifications);
router.patch('/actions/notifications/:id/read', markNotificationRead);
router.post('/actions/chatbot', chatbotAssistant);

// AI Reports
router.get('/ai-reports', getAiReports);

module.exports = router;