const mongoose = require('mongoose');

const CampSchema = new mongoose.Schema({
    campName: { type: String, required: true },
    place: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    contactNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    organizer: { type: String, required: true },
    message: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Camps', CampSchema);