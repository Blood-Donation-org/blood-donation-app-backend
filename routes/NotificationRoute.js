const express = require('express');
const router = express.Router();
const { 
    createNotification,
    getAllNotifications,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification
} = require('../controllers/NotificationController');

router.post('/create', createNotification);
router.get('/get-all', getAllNotifications);
router.get('/get-by-user/:userId', getNotificationsByUser);
router.patch('/mark-read/:id', markNotificationAsRead);
router.delete('/delete/:id', deleteNotification);

module.exports = router;
