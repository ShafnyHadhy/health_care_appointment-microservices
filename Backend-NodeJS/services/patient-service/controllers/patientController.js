const Patient = require("../models/Patient");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

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
      return res.status(400).json({ message: "Patient already exists" });
    }

    const patient = await Patient.create({
      name,
      email,
      password,
      phone,
      role: "patient",
      medicalReports: [],
    });

    if (patient) {
      try {
        await axios.post("http://localhost:3008/api/auth/register", {
          email: patient.email,
          password: req.body.password,
          role: "patient",
          refId: patient._id.toString(),
        });
      } catch (authError) {
        await Patient.findByIdAndDelete(patient._id);
        return res.status(500).json({
          message: "Failed to create auth credentials",
          error: authError.message,
        });
      }

      res.status(201).json({
        message: "Patient registered successfully",
        data: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          role: patient.role,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid patient data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get patient profile
 * @route   GET /api/patients/profile
 * @access  Private
 */
const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update patient profile
 * @route   PUT /api/patients/profile
 * @access  Private
 */
const updatePatientProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, address } = req.body;

    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update fields
    patient.name = name || patient.name;
    patient.phone = phone || patient.phone;
    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
    patient.gender = gender || patient.gender;
    patient.address = address || patient.address;

    await patient.save();

    res.json({
      message: "Profile updated successfully",
      data: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all patients
 * @route   GET /api/patients
 * @access  Private/Admin
 */
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).select("-password");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
    console.log("========== UPLOAD DEBUG START ==========");
    console.log("1. req.user:", req.user);
    console.log("2. req.user.id:", req.user?.id);
    console.log("3. req.file:", req.file);

    if (!req.file) {
      console.log("4. No file uploaded!");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("5. Looking for patient with ID:", req.user.id);
    const patient = await Patient.findById(req.user.id);

    console.log("6. Patient found:", patient ? patient._id : "NOT FOUND");

    if (!patient) {
      console.log("7. Patient NOT found! Cleaning up file...");
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Patient not found" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/reports/${req.file.filename}`;
    console.log("8. File URL:", fileUrl);

    const newReport = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: fileUrl,
      uploadDate: Date.now(),
    };

    console.log("9. New report object:", newReport);

    patient.medicalReports.push(newReport);
    await patient.save();

    console.log(
      "10. Report saved! Total reports:",
      patient.medicalReports.length,
    );
    console.log("========== UPLOAD DEBUG END ==========");

    res.status(201).json({
      message: "Medical report uploaded successfully",
      data: newReport,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ message: "Failed to upload report", error: error.message });
  }
};

/**
 * @desc    Get all reports for the logged in patient
 * @route   GET /api/patients/reports
 * @access  Private (Patient only)
 */
const getReports = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      count: patient.medicalReports.length,
      reports: patient.medicalReports,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
/**
 * @desc    Delete a medical report
 * @route   DELETE /api/patients/reports/:filename
 * @access  Private (Patient only)
 */
const deleteReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Find the report
    const reportIndex = patient.medicalReports.findIndex(
      (report) => report.fileName === filename,
    );

    if (reportIndex === -1) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Remove from database
    const deletedReport = patient.medicalReports[reportIndex];
    patient.medicalReports.splice(reportIndex, 1);
    await patient.save();

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", "uploads", "reports", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: "Medical report deleted successfully",
      deletedReport: deletedReport,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get prescriptions for the logged-in patient
 * @route   GET /api/patients/prescriptions
 * @access  Private (Patient only)
 */
const getMyPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Call doctor service to get prescriptions for this patient
    const response = await axios.get(
      `http://localhost:3002/api/doctors/patients/${patient._id}/prescriptions`,
      { headers: { Authorization: req.headers.authorization } },
    );

    res.json({
      count: response.data.length,
      prescriptions: response.data,
    });
  } catch (error) {
    // If doctor service is not available, return empty array
    if (error.code === "ECONNREFUSED") {
      res.json({
        count: 0,
        prescriptions: [],
        message: "Doctor service not available",
      });
    } else {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
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
};
