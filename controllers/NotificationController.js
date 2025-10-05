const Notification = require('../schemas/NotificationSchema');
const { validationResult } = require('express-validator');

// Create a new notification
const createNotification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }
        const { user, type, message, relatedRequest, status = 'unread' } = req.body;
        const notification = new Notification({ user, type, message, relatedRequest, status });
        await notification.save();
        await notification.populate('user').populate('relatedRequest');
        res.status(201).json({
            message: 'Notification created successfully',
            notification: {
                id: notification._id,
                user: notification.user,
                type: notification.type,
                message: notification.message,
                relatedRequest: notification.relatedRequest,
                status: notification.status,
                createdAt: notification.createdAt,
                updatedAt: notification.updatedAt
            },
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate('user').populate('relatedRequest');
        res.status(200).json({
            message: 'All notifications retrieved successfully',
            notifications: notifications.map(n => ({
                id: n._id,
                user: n.user,
                type: n.type,
                message: n.message,
                relatedRequest: n.relatedRequest,
                status: n.status,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt
            })),
            count: notifications.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get notifications by user
const getNotificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ user: userId }).populate('user').populate('relatedRequest');
        res.status(200).json({
            message: 'Notifications for user retrieved successfully',
            notifications: notifications.map(n => ({
                id: n._id,
                user: n.user,
                type: n.type,
                message: n.message,
                relatedRequest: n.relatedRequest,
                status: n.status,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt
            })),
            count: notifications.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findByIdAndUpdate(id, { status: 'read' }, { new: true }).populate('user').populate('relatedRequest');
        if (!updated) {
            return res.status(404).json({ message: 'Notification not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Notification marked as read',
            notification: updated,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Notification.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found', statusCode: 404 });
        }
        res.status(200).json({ message: 'Notification deleted successfully', statusCode: 200 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification
};
