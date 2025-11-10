const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    accountType: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minLength: 6},
    confirmPassword: {type: String, required: false, minLength: 6},
    role: {type: String, required: false},
    fullName: {type: String, required: false},
    phoneNumber: {type: String, required: false},
    dob: {type: String, required: false},
    bloodType: {type: String, required: false},
    address: {type: String, required: false},
    medicalHistory: {type: String, required: false},
    isDoner: {type: Boolean, required: false},
    isPatient: {type: Boolean, required: false},
    resetPasswordToken: {type: String, required: false},
    resetPasswordExpires: {type: Date, required: false},
}, {timestamps: true});

module.exports = mongoose.model('Users', UserSchema);