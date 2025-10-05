const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
    hospitalAffiliation: { type: String, required: true },
    specialization: { type: String, required: true },
    medicalLicenseNumber: { type: String, required: true },
    yearsOfExperience: { type: Number, required: false },
}, { timestamps: true });

module.exports = mongoose.model('DoctorProfiles', DoctorProfileSchema);