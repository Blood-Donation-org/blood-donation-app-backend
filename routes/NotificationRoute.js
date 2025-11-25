const express = require('express');
const router = express.Router();
const { 
    createNotification,
    getAllNotifications,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification,
    getAllBloodRequestNotifications,
    registerFCMToken,
    removeFCMToken,
    updateNotificationPreferences,
    getNotificationPreferences,
    sendTestPushNotification
} = require('../controllers/NotificationController');

// Existing notification routes
router.post('/create', createNotification);
router.get('/get-all', getAllNotifications);
router.get('/get-blood-requests', getAllBloodRequestNotifications);
router.get('/get-by-user/:userId', getNotificationsByUser);
router.patch('/mark-read/:id', markNotificationAsRead);
router.delete('/delete/:id', deleteNotification);

// Firebase Push Notification routes
router.post('/register-fcm-token', registerFCMToken);
router.post('/remove-fcm-token', removeFCMToken);
router.get('/preferences/:userId', getNotificationPreferences);
router.patch('/preferences/:userId', updateNotificationPreferences);
router.post('/test-push', sendTestPushNotification);

module.exports = router;
