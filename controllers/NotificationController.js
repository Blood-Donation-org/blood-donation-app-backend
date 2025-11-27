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
        
        // Validate userId parameter
        if (!userId) {
            return res.status(400).json({ 
                message: 'User ID is required', 
                statusCode: 400 
            });
        }

        // Validate that userId is a valid MongoDB ObjectId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                message: 'Invalid user ID format', 
                statusCode: 400 
            });
        }

        // Find notifications ONLY for the specific user
        const notifications = await Notification.find({ user: userId })
            .populate('user', 'fullName email role')
            .populate('relatedRequest')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Double-check security: ensure all notifications belong to the requested user
        const securityCheck = notifications.every(n => n.user && n.user._id.toString() === userId);
        if (!securityCheck) {
            return res.status(403).json({ 
                message: 'Unauthorized access to notifications', 
                statusCode: 403 
            });
        }

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
        
        // Validate notification ID parameter
        if (!id) {
            return res.status(400).json({ 
                message: 'Notification ID is required', 
                statusCode: 400 
            });
        }

        const updated = await Notification.findByIdAndUpdate(
            id, 
            { status: 'read' }, 
            { new: true }
        ).populate('user', 'fullName email role').populate('relatedRequest');

        if (!updated) {
            return res.status(404).json({ 
                message: 'Notification not found', 
                statusCode: 404 
            });
        }

        res.status(200).json({
            message: 'Notification marked as read',
            notification: {
                id: updated._id,
                user: updated.user,
                type: updated.type,
                message: updated.message,
                relatedRequest: updated.relatedRequest,
                status: updated.status,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt
            },
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
        
        // Validate notification ID parameter
        if (!id) {
            return res.status(400).json({ 
                message: 'Notification ID is required', 
                statusCode: 400 
            });
        }

        const deleted = await Notification.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ 
                message: 'Notification not found', 
                statusCode: 404 
            });
        }

        res.status(200).json({ 
            message: 'Notification deleted successfully', 
            statusCode: 200 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Create notification for all admin users
const createNotificationForAdmins = async ({ type, message, relatedRequest }) => {
    try {
        const User = require('../schemas/UserSchema');
        
        // Find all admin users
        let adminUsers = await User.find({ role: 'admin' });
        
        // If no admin users exist, try to create one
        if (adminUsers.length === 0) {
            const UserController = require('./UserController');
            try {
                await UserController.initializeAdmin();
                adminUsers = await User.find({ role: 'admin' });
            } catch (adminError) {
                adminUsers = await User.find({ role: 'admin' });
            }
        }
        
        if (adminUsers.length > 0) {
            // Create notifications for all admin users
            const adminNotifications = adminUsers.map(admin => ({
                user: admin._id,
                type: type,
                message: message,
                relatedRequest: relatedRequest,
                status: 'unread'
            }));
            
            const result = await Notification.insertMany(adminNotifications);
            
            return { success: true, count: result.length };
        } else {
            return { success: false, error: 'No admin users found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Helper function to get notification title based on type
const getNotificationTitle = (type) => {
    switch (type) {
        case 'blood-request':
            return '🩸 New Blood Request';
        case 'camp-registration':
            return '🏕️ Camp Registration';
        case 'blood-issue':
            return '📋 Blood Issue Update';
        case 'system':
            return '🔔 System Notification';
        default:
            return '📢 Blood Donation Alert';
    }
};

// Get all blood-request type notifications for admin users
const getAllBloodRequestNotifications = async (req, res) => {
    try {
        // Find all blood-request type notifications
        const bloodRequestNotifications = await Notification.find({ type: 'blood-request' })
            .populate('user', 'fullName email role')
            .populate('relatedRequest')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            message: 'Blood request notifications retrieved successfully',
            notifications: bloodRequestNotifications.map(n => ({
                id: n._id,
                user: n.user,
                type: n.type,
                message: n.message,
                relatedRequest: n.relatedRequest,
                status: n.status,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt
            })),
            count: bloodRequestNotifications.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification,
    createNotificationForAdmins,
    getAllBloodRequestNotifications
};
