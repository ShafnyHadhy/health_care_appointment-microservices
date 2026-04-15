const Admin = require('../models/Admin');
const Role = require('../models/Role');
const AdminNotification = require('../models/AdminNotification');
const PerformanceReview = require('../models/PerformanceReview');
const axios = require('axios');

const getAxiosConfig = (req) => {
    const token = req.headers.authorization;
    return {
        headers: {
            Authorization: token,
        },
    };
};

/**
 * @desc    Smart Search Suggestions
 * @route   GET /api/admin/actions/search-suggestions
 */
const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ suggestions: [] });

        const config = getAxiosConfig(req);
        
        // Parallel fetch for doctors and patients matching query
        const [doctorsRes, patientsRes] = await Promise.allSettled([
            axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors?search=${query}`, config),
            axios.get(`${process.env.PATIENT_SERVICE_URL}/api/patients?search=${query}`, config)
        ]);

        const doctors = doctorsRes.status === 'fulfilled' ? doctorsRes.value.data.data : [];
        const patients = patientsRes.status === 'fulfilled' ? patientsRes.value.data.data : [];

        const suggestions = [
            ...doctors.map(d => ({ type: 'doctor', id: d._id, text: `Dr. ${d.name} (${d.specialty})`, availability: d.availability })),
            ...patients.map(p => ({ type: 'patient', id: p._id, text: `Patient: ${p.name || p.fullName}` }))
        ].slice(0, 10);

        res.status(200).json({ suggestions });
    } catch (error) {
        res.status(500).json({ message: 'Search suggestions failed', error: error.message });
    }
};

/**
 * @desc    Predictive Analytics / Trends
 * @route   GET /api/admin/actions/analytics
 */
const getPredictiveAnalytics = async (req, res) => {
    try {
        const config = getAxiosConfig(req);
        const apptsRes = await axios.get(`${process.env.APPOINTMENT_SERVICE_URL}/api/appointments`, config);
        const appointments = apptsRes.data.data || [];

        // Simple Trend Analysis: Group by month
        const monthlyGroups = {};
        appointments.forEach(a => {
            const date = new Date(a.date || a.createdAt);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            monthlyGroups[monthYear] = (monthlyGroups[monthYear] || 0) + 1;
        });

        // Simple projection: average growth
        const months = Object.keys(monthlyGroups).sort();
        const counts = months.map(m => monthlyGroups[m]);
        
        let projection = 0;
        if (counts.length >= 2) {
            const last = counts[counts.length - 1];
            const prev = counts[counts.length - 2];
            projection = Math.round(last + (last - prev));
        } else {
            projection = counts[0] || 0;
        }

        res.status(200).json({
            historical: monthlyGroups,
            forecast: {
                nextMonth: projection,
                confidence: 'medium'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Analytics failed', error: error.message });
    }
};

/**
 * @desc    Manage Roles
 */
const getRoles = async (req, res) => {
    const roles = await Role.find();
    res.json(roles);
};

const createRole = async (req, res) => {
    const role = await Role.create(req.body);
    res.status(201).json(role);
};

/**
 * @desc    Gamification: Get Stats and Leaderboard
 */
const getGamificationData = async (req, res) => {
    try {
        const admins = await Admin.find().select('name points badges').sort({ points: -1 }).limit(10);
        const currentAdmin = await Admin.findById(req.user._id).select('points badges');

        res.json({
            leaderboard: admins,
            current: currentAdmin
        });
    } catch (error) {
        res.status(500).json({ message: 'Gamification data failed' });
    }
};

/**
 * @desc    Award Points for completion
 */
const awardPoints = async (req, res) => {
    try {
        const { points, badge } = req.body;
        const admin = await Admin.findById(req.user._id);
        
        admin.points += points || 10;
        if (badge && !admin.badges.includes(badge)) {
            admin.badges.push(badge);
        }
        
        await admin.save();
        res.json({ message: 'Points awarded', points: admin.points, badges: admin.badges });
    } catch (error) {
        res.status(500).json({ message: 'Awarding points failed' });
    }
};

/**
 * @desc    Smart Notifications
 */
const getNotifications = async (req, res) => {
    const notifications = await AdminNotification.find({ isRead: false }).sort({ createdAt: -1 });
    res.json(notifications);
};

const markNotificationRead = async (req, res) => {
    await AdminNotification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
};

/**
 * @desc    Integrated AI Chatbot Helper
 */
const chatbotAssistant = async (req, res) => {
    const { message } = req.body;
    // Simulated AI matching
    let response = "I'm sorry, I couldn't find information on that.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('doctor') && lowerMsg.includes('availability')) {
        response = "To check doctor availability, please use the Search bar above or go to the Doctors section.";
    } else if (lowerMsg.includes('report') || lowerMsg.includes('analytics')) {
        response = "I can generate a summary report for you. Our analytics show a steady growth in appointments this month.";
    } else if (lowerMsg.includes('how many patients')) {
        response = "Let me check... You currently have across all services."; // In real, would query counts
    }

    res.json({ response });
};

module.exports = {
    getSearchSuggestions,
    getPredictiveAnalytics,
    getRoles,
    createRole,
    getGamificationData,
    awardPoints,
    getNotifications,
    markNotificationRead,
    chatbotAssistant
};
