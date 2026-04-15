const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
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
        role: {
            type: String,
            default: 'admin',
        },
        roleRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        },
        points: {
            type: Number,
            default: 0
        },
        badges: [{
            type: String
        }],
        preferredLanguage: {
            type: String,
            default: 'en'
        }
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
