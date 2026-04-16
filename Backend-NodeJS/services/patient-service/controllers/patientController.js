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
    const patients = await Patient.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    // ✅ Return array directly (simpler for frontend)
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get patient by ID
 * @route   GET /api/patients/:id
 * @access  Private/Admin
 */
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({
      message: "Patient fetched successfully",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update a patient (Admin)
 * @route   PUT /api/patients/:id
 * @access  Private/Admin
 */
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Make sure this returns correct format
const getReports = async (req, res) => {
  try {
    console.log("=== getReports DEBUG START ===");
    console.log("1. req.user:", req.user);
    console.log("2. req.user.id:", req.user?.id);

    const patient = await Patient.findById(req.user.id);

    console.log("3. Patient found:", patient ? "YES" : "NO");
    console.log("4. Patient ID:", patient?._id);
    console.log(
      "5. Medical reports count:",
      patient?.medicalReports?.length || 0,
    );
    console.log(
      "6. Medical reports:",
      JSON.stringify(patient?.medicalReports, null, 2),
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      success: true,
      count: patient.medicalReports.length,
      reports: patient.medicalReports,
    });
    console.log("=== getReports DEBUG END ===");
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
      return res.status(404).json({ message: "Patient not found" });
    }

    // Also delete from auth service
    try {
      await axios.delete(
        `http://localhost:3008/api/auth/user/${req.params.id}`,
      );
    } catch (authError) {
      console.error("Failed to delete auth records:", authError.message);
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get patient medical reports by ID (for doctors)
 * @route   GET /api/patients/:patientId/medical-reports
 * @access  Private/Doctor
 */
const getPatientMedicalReportsByDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      count: patient.medicalReports.length,
      reports: patient.medicalReports,
    });
  } catch (error) {
    console.error("Error fetching patient reports:", error);
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

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("8. File URL:", fileUrl);

    const newReport = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl,
      uploadDate: new Date(),
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

    const reportIndex = patient.medicalReports.findIndex(
      (report) => report.fileName === filename,
    );

    if (reportIndex === -1) {
      return res.status(404).json({ message: "Report not found" });
    }

    const deletedReport = patient.medicalReports[reportIndex];
    patient.medicalReports.splice(reportIndex, 1);
    await patient.save();

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

const getMyPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Call doctor service to get prescriptions
    const response = await axios.get(
      `http://localhost:3002/api/doctors/patients/${patient._id}/prescriptions`,
      { headers: { Authorization: req.headers.authorization } },
    );

    // ✅ Return prescriptions array
    res.json({
      success: true,
      count: response.data.length,
      prescriptions: response.data,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    // Return empty array if doctor service is down
    res.json({
      success: true,
      count: 0,
      prescriptions: [],
    });
  }
};

/**
 * @desc    Get prescriptions for the logged-in patient
 * @route   GET /api/patients/prescriptions
 * @access  Private (Patient only)
 */

module.exports = {
  registerPatient,
  getPatientProfile,
  updatePatientProfile,
  getAllPatients,
  getPatientById,
  uploadReport,
  getReports,
  deleteReport,
  getMyPrescriptions,
  updatePatient,
  deletePatient,
  getPatientMedicalReportsByDoctor,
};
