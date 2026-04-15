const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * @desc    Register a new patient
 * @route   POST /api/patients/register
 * @access  Public
 */
const registerPatient = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const patientExists = await Patient.findOne({ email });

        if (patientExists) {
            return res.status(400).json({ message: 'Patient already exists' });
        }

        const patient = await Patient.create({
            name,
            email,
            password,
            phone,
            role: 'patient',
            medicalReports: []
        });

        if (patient) {
            try {
                await axios.post('http://localhost:3008/api/auth/register', {
                    email: patient.email,
                    password: req.body.password,
                    role: 'patient',
                    refId: patient._id
                });
            } catch (authError) {
                await Patient.findByIdAndDelete(patient._id);
                return res.status(500).json({ message: 'Failed to create auth credentials', error: authError.message });
            }

            res.status(201).json({
                message: 'Patient registered successfully',
                data: {
                    _id: patient._id,
                    name: patient.name,
                    email: patient.email,
                    role: patient.role,
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid patient data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};



/**
 * @desc    Get patient profile
 * @route   GET /api/patients/profile
 * @access  Private
 */
const getPatientProfile = async (req, res) => {
    
};

/**
 * @desc    Update patient profile
 * @route   PUT /api/patients/profile
 * @access  Private
 */
const updatePatientProfile = async (req, res) => {
    
};

/**
 * @desc    Get all patients
 * @route   GET /api/patients
 * @access  Private/Admin
 */
const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Patients fetched successfully',
            data: patients
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Update a patient (Admin)
 * @route   PUT /api/patients/:id
 * @access  Private/Admin
 */
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({
            message: 'Patient updated successfully',
            data: patient
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Delete a patient (Admin)
 * @route   DELETE /api/patients/:id
 * @access  Private/Admin
 */
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        // Also delete from auth service
        try {
            await axios.delete(`http://localhost:3008/api/auth/user/${req.params.id}`);
        } catch (authError) {
            console.error('Failed to delete auth records:', authError.message);
        }

        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ==========================================
// MEDICAL REPORTS FEATURES
// ==========================================

/**
 * @desc    Upload a medical report
 * @route   POST /api/patients/reports/upload
 * @access  Private (Patient only)
 */
const uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const patient = await Patient.findById(req.user.id);
        if (!patient) {
            // Clean up uploaded file if patient not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Create file URL using host domain (in dev likely localhost:3001)
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newReport = {
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileUrl: fileUrl,
            uploadDate: Date.now()
        };

        patient.medicalReports.push(newReport);
        await patient.save();

        res.status(201).json({
            message: 'Medical report uploaded successfully',
            data: newReport
        });
    } catch (error) {
        console.error('Upload Error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Failed to upload report', error: error.message });
    }
};

/**
 * @desc    Get all reports for the logged in patient
 * @route   GET /api/patients/reports
 * @access  Private (Patient only)
 */
const getReports = async (req, res) => {
    
};

/**
 * @desc    Delete a medical report
 * @route   DELETE /api/patients/reports/:filename
 * @access  Private (Patient only)
 */
const deleteReport = async (req, res) => {
    
};


/**
 * @desc    Get prescriptions for the logged-in patient
 * @route   GET /api/patients/prescriptions
 * @access  Private (Patient only)
 */
const getMyPrescriptions = async (req, res) => {
    
};

module.exports = {
    registerPatient,
    getPatientProfile,
    updatePatientProfile,
    getAllPatients,
    uploadReport,
    getReports,
    deleteReport,
    getMyPrescriptions,
    updatePatient,
    deletePatient
};
