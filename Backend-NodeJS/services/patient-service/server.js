const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const patientRoutes = require("./routes/patientRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Fix: Serve the uploads folder directly (not uploads/reports)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to patientdb"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/patients", patientRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "patient-service" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Patient Service running on port ${PORT}`);
});
