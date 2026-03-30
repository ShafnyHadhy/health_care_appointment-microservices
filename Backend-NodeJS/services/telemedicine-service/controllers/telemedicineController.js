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
    
};

/**
 * @desc    Get session details by Appointment ID
 * @route   GET /api/telemedicine/session/:appointmentId
 * @access  Private (Doctor or Patient)
 */
const getSession = async (req, res) => {
    
};

module.exports = {
    createSession,
    getSession
};
