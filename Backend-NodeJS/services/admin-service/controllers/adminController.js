const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Helper: Configure Axios requests with Admin JWT
const getAxiosConfig = (req) => {
    // Pass the admin's token along to other services if their endpoints are protected
    const token = req.headers.authorization;
    return {
        headers: {
            Authorization: token,
        },
    };
};

/**
 * @desc    Register Admin
 * @route   POST /api/admin/register
 * @access  Private/Admin
 */
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = await Admin.create({
            name,
            email,
            password,
            role: 'admin'
        });

        if (admin) {
            try {
                await axios.post('http://localhost:3008/api/auth/register', {
                    email: admin.email,
                    password: req.body.password,
                    role: 'admin',
                    refId: admin._id
                });
            } catch (authError) {
                await Admin.findByIdAndDelete(admin._id);
                return res.status(500).json({ message: 'Failed to create auth credentials', error: authError.message });
            }

            res.status(201).json({
                message: 'Admin registered successfully',
                data: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
            });
        }
    } catch (error) {
        console.error('Admin register error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get all users (patients and doctors)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
    
};

/**
 * @desc    Get all appointments
 * @route   GET /api/admin/appointments
 * @access  Private/Admin
 */
const getAllAppointments = async (req, res) => {
    
};

/**
 * @desc    Verify a doctor
 * @route   PUT /api/admin/doctors/verify/:id
 * @access  Private/Admin
 */
const verifyDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const config = getAxiosConfig(req);

        // Call Doctor service to verify
        const response = await axios.put(`${process.env.DOCTOR_SERVICE_URL}/api/doctors/${id}/verify`, {}, config);

        res.status(200).json({
            message: 'Doctor verified successfully',
            data: response.data.data
        });
    } catch (error) {
        console.error('Error verifying doctor:', error);
        // Extract error from axios response if available
        const msg = error.response ? error.response.data.message : error.message;
        res.status(500).json({ message: 'Failed to verify doctor', error: msg });
    }
};

/**
 * @desc    Get Dashboard Counts
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardCounts = async (req, res) => {
    try {
        const config = getAxiosConfig(req);

        // We can reuse the routes from above locally or call the other services again
        // For simplicity, we just make the parallel calls to other services again here
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.allSettled([
            axios.get(`${process.env.PATIENT_SERVICE_URL}/api/patients`, config),
            axios.get(`${process.env.DOCTOR_SERVICE_URL}/api/doctors`, config),
            axios.get(`${process.env.APPOINTMENT_SERVICE_URL}/api/appointments`, config)
        ]);

        const patients = patientsRes.status === 'fulfilled' ? patientsRes.value.data.data : [];
        const doctors = doctorsRes.status === 'fulfilled' ? doctorsRes.value.data.data : [];
        const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data.data : [];

        // Calculate revenue (sum of consultationFee for paid/completed appointments)
        let totalRevenue = 0;
        appointments.forEach(appt => {
            // Depending on exact schema. assuming isPaid or status === 'completed'
            if (appt.isPaid || appt.status === 'completed') {
                totalRevenue += (appt.consultationFee || 0);
            }
        });

        res.status(200).json({
            message: 'Dashboard data fetched',
            data: {
                totalPatients: patients.length,
                totalDoctors: doctors.length,
                totalAppointments: appointments.length,
                totalRevenue
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
    }
};

module.exports = {
    registerAdmin,
    getAllUsers,
    getAllAppointments,
    verifyDoctor,
    getDashboardCounts
};
