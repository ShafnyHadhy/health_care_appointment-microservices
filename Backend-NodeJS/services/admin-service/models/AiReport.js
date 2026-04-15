const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema({
    patientName: {
        type: String,
        default: 'Anonymous'
    },
    patientEmail: {
        type: String,
        default: 'Not Provided'
    },
    patientPhone: {
        type: String,
        default: 'Not Provided'
    },
    symptoms: {
        type: [String],
        required: true
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'Urgent', 'Critical'],
        default: 'Low'
    },
    disease: {
        type: String,
        required: true
    },
    recommendedSpecialty: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AiReport', aiReportSchema);
