const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String, // format "HH:mm" (e.g. "09:00")
    required: true
  },
  endTime: {
    type: String, // format "HH:mm"
    required: true
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    specialty: {
      type: String,
    },
    qualifications: [String],
    bio: {
      type: String,
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'doctor',
    },
    availability: [availabilitySchema]
  },
  {
    timestamps: true,
  }
);

doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
