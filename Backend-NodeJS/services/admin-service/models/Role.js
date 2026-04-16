const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        permissions: [{
            type: String,
            enum: [
                'view_dashboard',
                'manage_users',
                'manage_doctors',
                'view_medical_records',
                'manage_appointments',
                'view_reports',
                'manage_roles',
                'manage_billing'
            ]
        }],
    },
    {
        timestamps: true,
    }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
