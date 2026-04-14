const Session = require('../models/Session');
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');

// Helper to configure Axios
const getAxiosConfig = (req) => {
    return {
        headers: {
            Authorization: req.headers.authorization,
        },
    };
};

/**
 * @desc    Create a new telemedicine session (Jitsi)
 * @route   POST /api/telemedicine/session/create
 * @access  Private (Doctor or Patient)
 */
const createSession = async (req, res) => {
    try {
        const { appointmentId, doctorId, patientId } = req.body;

        if (!appointmentId || !doctorId || !patientId) {
            return res.status(400).json({ message: 'Appointment ID, Doctor ID, and Patient ID are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(appointmentId) || 
            !mongoose.Types.ObjectId.isValid(doctorId) || 
            !mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: 'Invalid ID format provided' });
        }

        let session = await Session.findOne({ appointmentId });

        if (session) {
            return res.status(200).json({
                message: 'Session already exists',
                data: session
            });
        }

        const randomHash = crypto.randomBytes(4).toString('hex');
        const meetUrl = `https://meet.jit.si/healthcare_appt_${appointmentId}_${randomHash}`;

        // Create session
        session = await Session.create({
            appointmentId,
            doctorId,
            patientId,
            platform: 'Jitsi',
            meetUrl,
            status: 'scheduled',
            // Expires 2 hours from now as a default
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
        });

        res.status(201).json({
            message: 'Telemedicine session created',
            data: session
        });

    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get session details by Appointment ID
 * @route   GET /api/telemedicine/session/:appointmentId
 * @access  Private (Doctor or Patient)
 */
const getSession = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).json({ message: 'Invalid appointment ID format' });
        }

        const session = await Session.findOne({ appointmentId });

        if (!session) {
            return res.status(404).json({ message: 'Session not found for this appointment' });
        }

        // Authorization: only the assigned doctor or patient (or an admin) can view the session link
        const userId = req.user.id.toString();
        const role = req.user.role;

        if (
            role !== 'admin' &&
            session.doctorId.toString() !== userId &&
            session.patientId.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Not authorized to access this session' });
        }

        res.status(200).json({
            message: 'Session retrieved successfully',
            data: session
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createSession,
    getSession
};
