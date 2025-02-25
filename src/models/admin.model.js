const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true

    },
    password: { type: String, required: true },

    role: { type: String, default: 'admin' }
});

// Hash password before saving
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export const Admin = mongoose.model('Admin', AdminSchema);
