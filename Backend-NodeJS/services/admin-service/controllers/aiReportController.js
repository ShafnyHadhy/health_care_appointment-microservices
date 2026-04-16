const AiReport = require('../models/AiReport');

// @desc    Save a new AI Diagnostic Report
// @route   POST /api/admin/ai-reports/public
// @access  Public (Called by SymptomChecker frontend directly)
const saveAiReport = async (req, res) => {
    try {
        const {
            patientName,
            patientEmail,
            patientPhone,
            symptoms,
            riskLevel,
            disease,
            recommendedSpecialty
        } = req.body;

        if (!symptoms || !disease) {
            return res.status(400).json({ success: false, message: 'Symptoms and disease are required fields.' });
        }

        const report = await AiReport.create({
            patientName,
            patientEmail,
            patientPhone,
            symptoms,
            riskLevel,
            disease,
            recommendedSpecialty
        });

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        console.error('[AI REPORT SAVE ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all AI Diagnostic Reports
// @route   GET /api/admin/ai-reports
// @access  Private/Admin
const getAiReports = async (req, res) => {
    try {
        const reports = await AiReport.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        console.error('[AI REPORT GET ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    saveAiReport,
    getAiReports
};
