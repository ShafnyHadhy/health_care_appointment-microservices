const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    patientName: String,
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    doctorName: String,
    specialty: String,
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "09:00 - 09:30"
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'confirmed', 'cancelled', 'completed', 'rejected'],
      default: 'pending',
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 0
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
