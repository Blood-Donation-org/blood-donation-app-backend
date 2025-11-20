const mongoose = require('mongoose');

// Function to generate unique blood packet ID
const generateBloodPacketId = () => {
    const prefix = 'BP';
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random number
    return `${prefix}${timestamp}${random}`;
};

const BloodInventorySchema = new mongoose.Schema({
    bloodPacketId: {
        type: String,
        required: true,
        unique: true,
        default: generateBloodPacketId
    },
    bloodType: { type: String, required: true },
    units: { type: Number, required: true },
    donerName: { type: String, required: true },
    donerphone: { type: String, required: true },
    donerAge: { type: Number, required: true },
    donationDate: { type: String, required: true },
    Notes: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);