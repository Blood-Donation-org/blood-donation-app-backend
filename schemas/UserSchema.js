const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    accountType: {type: String},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minLength: 6},
    confirmPassword: {type: String, required: true, minLength: 6},
    role: {type: String, required: true},
    fullName: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    dob: {type: String, required: true},
    bloodType: {type: String, required: true},
    address: {type: String, required: true},
    medicalHistory: {type: String, required: false},
    isDoner: {type: Boolean, required: false},
    isPatient: {type: Boolean, required: false},
}, {timestamps: true});

module.exports = mongoose.model('Users', UserSchema);