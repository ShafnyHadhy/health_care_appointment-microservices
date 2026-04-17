const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const doctorRoutes = require("./routes/doctorRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (if needed for uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/doctors", doctorRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "doctor-service",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Doctor Service running on port ${PORT}`);
  console.log("📋 Health check: /health");
  console.log("🔗 API endpoint: /api/doctors");
});
