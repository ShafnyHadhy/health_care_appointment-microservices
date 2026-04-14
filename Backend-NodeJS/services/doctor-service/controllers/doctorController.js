const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");
const axios = require("axios");
const jwt = require("jsonwebtoken");

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
        await axios.post("http://localhost:3008/api/auth/register", {
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

    // Call appointment service
    const response = await axios.put(
      `http://localhost:3003/api/appointments/${appointmentId}/status`,
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
      return res
        .status(400)
        .json({ message: "Patient ID and at least one medication required" });
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

    const response = await axios.get(
      `http://localhost:3002/api/patients/${patientId}/reports`,
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

module.exports = {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
  getAllDoctors,
  verifyDoctor,
  acceptOrRejectAppointment,
  issuePrescription,
  viewPatientReports,
  getPatientPrescriptions,
};
