const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const base = (u) => (u || "").replace(/\/$/, "");
const requireEnvUrl = (name) => {
  const url = base(process.env[name]);
  if (!url) {
    throw new Error(`${name} is not set`);
  }
  return url;
};

// Register new doctor
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialty, phone, consultationFee } =
      req.body;

    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const doctor = await Doctor.create({
      name,
      email,
      password,
      specialty,
      phone,
      consultationFee: consultationFee || 0,
      role: "doctor",
    });

    if (doctor) {
      try {
        const AUTH_SERVICE_URL = requireEnvUrl("AUTH_SERVICE_URL");
        await axios.post(`${AUTH_SERVICE_URL}/api/auth/register`, {
          email: doctor.email,
          password: req.body.password,
          role: "doctor",
          refId: doctor._id.toString(),
        });

        res.status(201).json({
          message: "Doctor registered successfully",
          data: {
            _id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            specialty: doctor.specialty,
            isVerified: doctor.isVerified,
          },
        });
      } catch (authError) {
        await Doctor.findByIdAndDelete(doctor._id);
        return res.status(500).json({
          message: "Failed to create auth credentials",
          error: authError.message,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-password");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { name, phone, specialty, qualifications, bio, consultationFee } =
      req.body;
    const doctor = await Doctor.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.name = name || doctor.name;
    doctor.phone = phone || doctor.phone;
    doctor.specialty = specialty || doctor.specialty;
    doctor.qualifications = qualifications || doctor.qualifications;
    doctor.bio = bio || doctor.bio;
    doctor.consultationFee = consultationFee || doctor.consultationFee;

    await doctor.save();
    res.json({ message: "Profile updated successfully", data: doctor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const doctor = await Doctor.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.availability = availability;
    await doctor.save();
    res.json({
      message: "Availability updated successfully",
      data: doctor.availability,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get availability
const getAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("availability");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor.availability || []);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const { specialty, minFee, maxFee } = req.query;
    let filter = { isVerified: true };

    if (specialty) filter.specialty = specialty;
    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = parseInt(minFee);
      if (maxFee) filter.consultationFee.$lte = parseInt(maxFee);
    }

    const doctors = await Doctor.find(filter).select("-password");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllDoctors2 = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Doctors fetched successfully',
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Verify doctor (admin only)
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.isVerified = true;
    await doctor.save();
    res.json({ message: "Doctor verified successfully", data: doctor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Accept or reject appointment
const acceptOrRejectAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const appointmentId = req.params.id;

    const APPOINTMENT_SERVICE_URL = requireEnvUrl("APPOINTMENT_SERVICE_URL");
    const response = await axios.put(
      `${APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}/status`,
      { status, doctorId: req.user.id },
      { headers: { Authorization: req.headers.authorization } },
    );

    res.json({
      message: `Appointment ${status} successfully`,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Issue prescription
const issuePrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medications, notes } = req.body;

    if (!patientId || !medications || medications.length === 0) {
      return res.status(400).json({
        message: "Patient ID and at least one medication required",
      });
    }

    const prescription = await Prescription.create({
      doctorId: req.user.id,
      patientId,
      appointmentId,
      medications,
      notes,
    });

    res.status(201).json({
      message: "Prescription issued successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// View patient reports
const viewPatientReports = async (req, res) => {
  try {
    const patientId = req.params.id;

    const PATIENT_SERVICE_URL = requireEnvUrl("PATIENT_SERVICE_URL");
    const response = await axios.get(
      `${PATIENT_SERVICE_URL}/api/patients/patients/${patientId}/medical-reports`,
      { headers: { Authorization: req.headers.authorization } },
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get patient prescriptions
const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.params.id;
    const prescriptions = await Prescription.find({ patientId }).sort({
      createdAt: -1,
    });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all prescriptions for logged-in doctor
const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      doctorId: req.user.id,
    }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { medications, notes } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { medications, notes },
      { new: true },
    );
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    res.json({
      message: "Prescription updated successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update doctor (Admin only)
const updateDoctor = async (req, res) => {
  try {
    const {
      name,
      phone,
      specialty,
      qualifications,
      bio,
      consultationFee,
      isVerified,
    } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.name = name || doctor.name;
    doctor.phone = phone || doctor.phone;
    doctor.specialty = specialty || doctor.specialty;
    doctor.qualifications = qualifications || doctor.qualifications;
    doctor.bio = bio || doctor.bio;
    doctor.consultationFee = consultationFee || doctor.consultationFee;
    doctor.isVerified =
      isVerified !== undefined ? isVerified : doctor.isVerified;

    await doctor.save();
    res.json({ message: "Doctor updated successfully", data: doctor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete doctor (Admin only)
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
  getAvailability,
  getAllDoctors,
  getAllDoctors2,
  verifyDoctor,
  acceptOrRejectAppointment,
  issuePrescription,
  viewPatientReports,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  deletePrescription,
  updatePrescription,
  updateDoctor,
  deleteDoctor,
};
