const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema(
    {
        doctorId: {
            type: String, // ID from doctor-service
            required: true,
        },
        doctorName: {
            type: String,
        },
        patientId: {
            type: String, // ID from patient-service
        },
        appointmentId: {
            type: String, // ID from appointment-service
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
        },
        tags: [String], // e.g., 'Punctual', 'Knowledgeable'
    },
    {
        timestamps: true,
    }
);

const PerformanceReview = mongoose.model('PerformanceReview', performanceReviewSchema);

module.exports = PerformanceReview;
