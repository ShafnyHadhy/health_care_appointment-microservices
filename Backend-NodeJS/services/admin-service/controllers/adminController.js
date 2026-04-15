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
    try {
        const config = getAxiosConfig(req);
        const patientUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:3001';
        const doctorUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';

        const [patientsRes, doctorsRes] = await Promise.allSettled([
            axios.get(`${patientUrl}/api/patients`, config),
            axios.get(`${doctorUrl}/api/doctors`, config)
        ]);

        const patients = patientsRes.status === 'fulfilled' ? patientsRes.value.data.data.map(p => ({ ...p, userType: 'patient' })) : [];
        const doctors = doctorsRes.status === 'fulfilled' ? doctorsRes.value.data.data.map(d => ({ ...d, userType: 'doctor' })) : [];

        res.status(200).json({
            message: 'Users fetched successfully',
            data: { patients, doctors, all: [...patients, ...doctors] }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

/**
 * @desc    Get all appointments
 * @route   GET /api/admin/appointments
 * @access  Private/Admin
 */
const getAllAppointments = async (req, res) => {
    try {
        const config = getAxiosConfig(req);
        const apptUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003';
        
        const response = await axios.get(`${apptUrl}/api/appointments`, config);

        res.status(200).json({
            message: 'Appointments fetched successfully',
            data: response.data.data
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
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

        // --- Analytics Calculations ---
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        // 1. Registrations over last 7 days
        const registrationsByDate = last7Days.map(date => {
            const count = [...patients, ...doctors].filter(u => {
                const uDate = u.createdAt ? u.createdAt.split('T')[0] : null;
                return uDate === date;
            }).length;
            return count;
        });

        // 2. Revenue over last 7 days
        let totalRevenue = 0;
        const revenueByDate = last7Days.map(date => {
            let dailyRev = 0;
            appointments.forEach(appt => {
                const apptDate = appt.appointmentDate ? appt.appointmentDate.split('T')[0] : null;
                if (apptDate === date && (appt.isPaid || appt.status === 'completed')) {
                    const fee = appt.consultationFee || 0;
                    dailyRev += fee;
                }
                // Aggregate for total
                if (appt.isPaid || appt.status === 'completed') {
                    totalRevenue += (appt.consultationFee || 0);
                }
            });
            return dailyRev;
        });

        // 3. Appointments by Specialty
        const specialtyMap = {};
        appointments.forEach(appt => {
            const spec = appt.specialization || 'General';
            specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
        });
        const appointmentsBySpecialty = Object.entries(specialtyMap).map(([name, count]) => ({ name, count }));

        res.status(200).json({
            message: 'Dashboard data fetched',
            data: {
                totalPatients: patients.length,
                totalDoctors: doctors.length,
                totalAppointments: appointments.length,
                totalRevenue: appointments.reduce((sum, a) => sum + (a.isPaid ? a.consultationFee : 0), 0),
                analytics: {
                    registrationsByDate,
                    revenueByDate,
                    appointmentsBySpecialty,
                    labels: last7Days.map(d => d.split('-').slice(1).join('/')) // MM/DD
                }
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
    }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:type/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    try {
        const { type, id } = req.params;
        const config = getAxiosConfig(req);
        
        if (type === 'patient') {
            const patientUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:3001';
            await axios.delete(`${patientUrl}/api/patients/${id}`, config);
        } else if (type === 'doctor') {
            const doctorUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';
            await axios.delete(`${doctorUrl}/api/doctors/${id}`, config);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        res.status(200).json({ message: `${type} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting user:', error);
        const msg = error.response ? error.response.data.message : error.message;
        res.status(500).json({ message: 'Failed to delete user', error: msg });
    }
};

/**
 * @desc    Update a user
 * @route   PUT /api/admin/users/:type/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
    try {
        const { type, id } = req.params;
        const config = getAxiosConfig(req);
        
        if (type === 'patient') {
            const patientUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:3001';
            await axios.put(`${patientUrl}/api/patients/${id}`, req.body, config);
        } else if (type === 'doctor') {
            const doctorUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';
            await axios.put(`${doctorUrl}/api/doctors/${id}`, req.body, config);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        res.status(200).json({ message: `${type} updated successfully.` });
    } catch (error) {
        console.error('Error updating user:', error);
        const msg = error.response ? error.response.data.message : error.message;
        res.status(500).json({ message: 'Failed to update user', error: msg });
    }
};

/**
 * @desc    Reject a doctor
 * @route   PUT /api/admin/doctors/reject/:id
 * @access  Private/Admin
 */
const rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const config = getAxiosConfig(req);
        
        const doctorUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';
        
        // Either the doctor service has a reject endpoint, or we can soft delete it or mark it rejected via update
        // We'll simulate a rejection via update if there's no endpoint, or call delete.
        // Assuming there's a reject endpoint or we delete the application
        // We will just do a DELETE since it's rejected, or an update if we want to keep records
        try {
            await axios.put(`${doctorUrl}/api/doctors/${id}`, { isVerified: false, status: 'rejected' }, config);
        } catch(updateErr) {
            // fallback if it doesn't work, just delete them
            await axios.delete(`${doctorUrl}/api/doctors/${id}`, config);
        }

        res.status(200).json({ message: 'Doctor application rejected successfully' });
    } catch (error) {
        console.error('Error rejecting doctor:', error);
        res.status(500).json({ message: 'Failed to reject doctor', error: error.message });
    }
};

module.exports = {
    registerAdmin,
    getAllUsers,
    getAllAppointments,
    verifyDoctor,
    getDashboardCounts,
    deleteUser,
    updateUser,
    rejectDoctor
};
