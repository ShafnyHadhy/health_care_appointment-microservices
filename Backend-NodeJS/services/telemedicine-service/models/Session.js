const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        platform: {
            type: String,
            default: 'Jitsi',
        },
        meetUrl: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['scheduled', 'ongoing', 'completed'],
            default: 'scheduled',
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
