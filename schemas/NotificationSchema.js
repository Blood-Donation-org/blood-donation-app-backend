const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    type: { type: String, required: true }, // e.g., 'blood-request', 'approval', etc.
    message: { type: String, required: true },
    relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequests' },
    status: { type: String, default: 'unread' }, // 'unread', 'read'
}, { timestamps: true });

module.exports = mongoose.model('Notifications', NotificationSchema);
