const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    bloodType: { type: String, required: true },
    unitsRequired: { type: Number, required: true },
    urgencyLevel: { type: String, required: true },
    wardNumber: { type: String, required: true },
    contactNumber: { type: String, required: true },
    medicalCondition: { type: String, required: true },
    surgeryDate: { type: Date },
    additionalNotes: { type: String },
    dtFormUpload: { type: String }, 
    status: { type: String, default: 'pending' },
    confirmationStatus: { type: String, default: 'unconfirmed' }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequests', BloodRequestSchema);
