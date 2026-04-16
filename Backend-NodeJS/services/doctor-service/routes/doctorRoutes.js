const express = require("express");
const router = express.Router();
const {
  registerDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
  getAvailability,
  getAllDoctors,
  verifyDoctor,
  acceptOrRejectAppointment,
  issuePrescription,
  viewPatientReports,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  updatePrescription,
  deletePrescription,
  updateDoctor,
  deleteDoctor,
  getAllDoctors2,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/auth");

// ==================== PUBLIC ROUTES ====================
router.post("/register", registerDoctor);
router.get("/", getAllDoctors);
router.get("/appDoc", getAllDoctors2);

// ==================== PROTECTED DOCTOR PROFILE ROUTES ====================
router.get("/profile", protect, authorize("doctor"), getDoctorProfile);
router.put("/profile", protect, authorize("doctor"), updateDoctorProfile);
router.put("/availability", protect, authorize("doctor"), updateAvailability);
router.get("/availability", protect, authorize("doctor"), getAvailability);

// ==================== APPOINTMENT ROUTES ====================
router.put(
  "/appointments/:id/status",
  protect,
  authorize("doctor"),
  acceptOrRejectAppointment,
);

// ==================== PRESCRIPTION ROUTES ====================
router.post("/prescriptions", protect, authorize("doctor"), issuePrescription);
router.get(
  "/prescriptions",
  protect,
  authorize("doctor"),
  getDoctorPrescriptions,
);
router.put(
  "/prescriptions/:id",
  protect,
  authorize("doctor"),
  updatePrescription,
);
router.delete(
  "/prescriptions/:id",
  protect,
  authorize("doctor"),
  deletePrescription,
);

// ==================== PATIENT RELATED ROUTES ====================
router.get("/patients/:id/prescriptions", protect, getPatientPrescriptions);
router.get(
  "/patients/:id/reports",
  protect,
  authorize("doctor"),
  viewPatientReports,
);

// ==================== ADMIN ROUTES ====================
router.put("/:id/verify", protect, authorize("admin"), verifyDoctor);
router.put("/:id", protect, authorize("admin"), updateDoctor);
router.delete("/:id", protect, authorize("admin"), deleteDoctor);

module.exports = router;
