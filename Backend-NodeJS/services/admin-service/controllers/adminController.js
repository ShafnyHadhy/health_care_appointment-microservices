const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Helper: Configure Axios requests with Admin JWT
const getAxiosConfig = (req) => {
    const token = req.headers.authorization;
    return {
        headers: {
            Authorization: token,
        },
    };
};

const base = (u) => (u || '').replace(/\/$/, '');
const requireEnvUrl = (name) => {
    const url = base(process.env[name]);
    if (!url) throw new Error(`${name} is not set`);
    return url;
};

// Many services return either an array directly or { data: [...] }.
const extractArray = (axiosResponse) => {
    const payload = axiosResponse?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

// Resolve service URLs lazily so the admin-service can boot even if some env vars are missing.
// Missing vars will throw only when the corresponding endpoint is invoked.
const PATIENT_SERVICE = () => requireEnvUrl('PATIENT_SERVICE_URL');
const DOCTOR_SERVICE = () => requireEnvUrl('DOCTOR_SERVICE_URL');
const APPOINTMENT_SERVICE = () => requireEnvUrl('APPOINTMENT_SERVICE_URL');
const AUTH_SERVICE = () => requireEnvUrl('AUTH_SERVICE_URL');

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
                await axios.post(`${AUTH_SERVICE()}/api/auth/register`, {
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

        const [patientsRes, doctorsRes] = await Promise.allSettled([
            axios.get(`${PATIENT_SERVICE()}/api/patients`, config),
            axios.get(`${DOCTOR_SERVICE()}/api/doctors/appDoc`, config)
        ]);

        const patientsRaw = patientsRes.status === 'fulfilled' ? extractArray(patientsRes.value) : [];
        const doctorsRaw = doctorsRes.status === 'fulfilled' ? extractArray(doctorsRes.value) : [];

        // Log states for debugging
        console.log(`[ADMIN-SERVICE] Fetched ${patientsRaw.length} patients and ${doctorsRaw.length} doctors.`);
        if (patientsRes.status === 'rejected') console.error('[ADMIN-SERVICE] Patient Service Error:', patientsRes.reason.message);
        if (doctorsRes.status === 'rejected') console.error('[ADMIN-SERVICE] Doctor Service Error:', doctorsRes.reason.message);

        // Standardize properties for frontend (handle name/fullName/doctorName)
        const patients = patientsRaw.map((p) => ({ 
            ...p, 
            name: p.name || p.fullName || 'Unknown Patient',
            userType: 'patient' 
        }));
        const doctors = doctorsRaw.map((d) => ({ 
            ...d, 
            name: d.name || d.fullName || 'Unknown Doctor',
            userType: 'doctor' 
        }));

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
        const response = await axios.get(`${APPOINTMENT_SERVICE()}/api/appointments`, config);
        
        // Robust extraction for appointments
        const appts = extractArray(response);
        console.log(`[ADMIN-SERVICE] Fetched ${appts.length} appointments.`);

        res.status(200).json({
            message: 'Appointments fetched successfully',
            data: appts
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
        const response = await axios.put(`${DOCTOR_SERVICE()}/api/doctors/${id}/verify`, {}, config);

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
            axios.get(`${PATIENT_SERVICE()}/api/patients`, config),
            axios.get(`${DOCTOR_SERVICE()}/api/doctors/appDoc`, config),
            axios.get(`${APPOINTMENT_SERVICE()}/api/appointments`, config)
        ]);

        const patients = patientsRes.status === 'fulfilled' ? extractArray(patientsRes.value) : [];
        const doctors = doctorsRes.status === 'fulfilled' ? extractArray(doctorsRes.value) : [];

        // appointment-service returns: { message, data: [...] }
        const appointments = appointmentsRes.status === 'fulfilled'
            ? (appointmentsRes.value?.data?.data || [])
            : [];

        // --- Analytics Calculations ---
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        // 1. Registrations over last 7 days
        const registrationsByDate = last7Days.map(date => {
            const count = [...patients, ...doctors].filter(u => {
                const uDate = u?.createdAt ? u.createdAt.split('T')[0] : null;
                return uDate === date;
            }).length;
            return count;
        });

        // 2. Revenue over last 7 days
        const revenueByDate = last7Days.map(date => {
            let dailyRev = 0;

            appointments.forEach(appt => {
                const rawDate = appt?.appointmentDate || appt?.date; // supports both field names
                const apptDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : null;

                if (apptDate === date && (appt?.isPaid || appt?.status === 'completed' || appt?.status === 'confirmed')) {
                    dailyRev += (appt?.consultationFee || 0);
                }
            });

            return dailyRev;
        });

        // 3. Appointments by Specialty
        const specialtyMap = {};
        appointments.forEach(appt => {
            const spec = appt?.specialization || appt?.specialty || 'General';
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
            await axios.delete(`${PATIENT_SERVICE()}/api/patients/${id}`, config);
        } else if (type === 'doctor') {
            await axios.delete(`${DOCTOR_SERVICE()}/api/doctors/${id}`, config);
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
            await axios.put(`${PATIENT_SERVICE()}/api/patients/${id}`, req.body, config);
        } else if (type === 'doctor') {
            await axios.put(`${DOCTOR_SERVICE()}/api/doctors/${id}`, req.body, config);
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
        
        // Send rejection status to Doctor service
        await axios.put(`${DOCTOR_SERVICE()}/api/doctors/${id}`, { isVerified: false, status: 'rejected' }, config);

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
