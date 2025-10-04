const mongoose = require('mongoose');

const BloodInventorySchema = new mongoose.Schema({
    bloodType: { type: String, required: true },
    units: { type: Number, required: true },
    donerName: { type: String, required: true },
    donerphone: { type: String, required: true },
    donerAge: { type: Number, required: true },
    donationDate: { type: String, required: true },
    Notes: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);