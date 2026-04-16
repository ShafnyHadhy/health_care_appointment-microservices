const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const {
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
} = require("../controllers/patientController");

// PUBLIC
router.post("/register", registerPatient);

// PATIENT OWN ROUTES - static first
router.get("/profile", protect, authorize("patient"), getPatientProfile);
router.put("/profile", protect, authorize("patient"), updatePatientProfile);

router.get("/prescriptions", protect, authorize("patient"), getMyPrescriptions);

router.post(
  "/reports/upload",
  protect,
  authorize("patient"),
  upload.single("report"),
  uploadReport,
);
router.get("/reports", protect, authorize("patient"), getReports);
router.delete(
  "/reports/:filename",
  protect,
  authorize("patient"),
  deleteReport,
);

// DOCTOR ROUTES
router.get(
  "/patients/:patientId/medical-reports",
  protect,
  authorize("doctor"),
  getPatientMedicalReportsByDoctor,
);

// ADMIN ROUTES - dynamic later
router.get("/", protect, authorize("admin", "doctor"), getAllPatients);
router.get("/:id", protect, authorize("admin"), getPatientById);
router.put("/:id", protect, authorize("admin"), updatePatient);
router.delete("/:id", protect, authorize("admin"), deletePatient);

module.exports = router;
