const mongoose = require('mongoose');

const BloodIssueSchema = new mongoose.Schema({
    bloodType: { type: String, required: true },
    unitsIssued: { type: Number, required: true },
    remainingUnits: { type: Number, required: true },
    requestId: { type: String, required: false },
    doctorName: { type: String, required: false },
    patientName: { type: String, required: false },
    reason: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('BloodIssues', BloodIssueSchema);