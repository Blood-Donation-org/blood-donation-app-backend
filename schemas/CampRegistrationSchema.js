const mongoose = require('mongoose');

const CampRegistrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    campId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camps', required: true }
}, { timestamps: true });

module.exports = mongoose.model('CampRegistrations', CampRegistrationSchema);