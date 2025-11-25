const Notification = require('../schemas/NotificationSchema');
const { validationResult } = require('express-validator');
const firebaseService = require('../services/firebaseService');

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
            
            // Send Firebase push notifications to admin users
            await sendPushNotificationsToAdmins(adminUsers, {
                title: getNotificationTitle(type),
                body: message,
                type: type,
                relatedRequest: relatedRequest?.toString()
            });
            
            return { success: true, count: result.length };
        } else {
            return { success: false, error: 'No admin users found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Helper function to send push notifications to admin users
const sendPushNotificationsToAdmins = async (adminUsers, notificationData) => {
    try {
        // Collect all FCM tokens from admin users
        const fcmTokens = [];
        
        adminUsers.forEach(admin => {
            if (admin.fcmTokens && admin.fcmTokens.length > 0) {
                // Filter active tokens (not older than 30 days)
                const activeTokens = admin.fcmTokens.filter(tokenObj => {
                    const daysSinceLastUsed = (Date.now() - tokenObj.lastUsed) / (1000 * 60 * 60 * 24);
                    return daysSinceLastUsed <= 30;
                });
                
                fcmTokens.push(...activeTokens.map(tokenObj => tokenObj.token));
            }
        });
        
        if (fcmTokens.length > 0) {
            console.log(`Sending push notifications to ${fcmTokens.length} admin devices`);
            
            const result = await firebaseService.sendPushNotificationToMultiple(
                fcmTokens,
                notificationData.title,
                notificationData.body,
                {
                    type: notificationData.type,
                    relatedRequest: notificationData.relatedRequest || '',
                    notificationId: Date.now().toString()
                }
            );
            
            console.log('Push notification result:', result);
            return result;
        } else {
            console.log('No active FCM tokens found for admin users');
            return { success: false, message: 'No active FCM tokens found' };
        }
    } catch (error) {
        console.error('Error sending push notifications to admins:', error);
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

// Register FCM token for push notifications
const registerFCMToken = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }

        const { userId, fcmToken, deviceInfo } = req.body;

        if (!userId || !fcmToken) {
            return res.status(400).json({ 
                message: 'User ID and FCM token are required', 
                statusCode: 400 
            });
        }

        const User = require('../schemas/UserSchema');
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                statusCode: 404 
            });
        }

        // Check if token already exists
        const existingTokenIndex = user.fcmTokens.findIndex(tokenObj => tokenObj.token === fcmToken);

        if (existingTokenIndex > -1) {
            // Update existing token's lastUsed timestamp
            user.fcmTokens[existingTokenIndex].lastUsed = new Date();
            user.fcmTokens[existingTokenIndex].deviceInfo = deviceInfo || user.fcmTokens[existingTokenIndex].deviceInfo;
        } else {
            // Add new token
            user.fcmTokens.push({
                token: fcmToken,
                deviceInfo: deviceInfo || 'Unknown Device',
                createdAt: new Date(),
                lastUsed: new Date()
            });
        }

        // Limit to 5 most recent tokens per user
        if (user.fcmTokens.length > 5) {
            user.fcmTokens.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
            user.fcmTokens = user.fcmTokens.slice(0, 5);
        }

        await user.save();

        res.status(200).json({
            message: 'FCM token registered successfully',
            statusCode: 200,
            tokenCount: user.fcmTokens.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Remove FCM token
const removeFCMToken = async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;

        if (!userId || !fcmToken) {
            return res.status(400).json({ 
                message: 'User ID and FCM token are required', 
                statusCode: 400 
            });
        }

        const User = require('../schemas/UserSchema');
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                statusCode: 404 
            });
        }

        // Remove the token
        user.fcmTokens = user.fcmTokens.filter(tokenObj => tokenObj.token !== fcmToken);
        await user.save();

        res.status(200).json({
            message: 'FCM token removed successfully',
            statusCode: 200,
            tokenCount: user.fcmTokens.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }

        const { userId } = req.params;
        const { pushNotifications, bloodRequestNotifications, campNotifications, systemNotifications } = req.body;

        const User = require('../schemas/UserSchema');
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                statusCode: 404 
            });
        }

        // Update preferences
        if (pushNotifications !== undefined) user.notificationPreferences.pushNotifications = pushNotifications;
        if (bloodRequestNotifications !== undefined) user.notificationPreferences.bloodRequestNotifications = bloodRequestNotifications;
        if (campNotifications !== undefined) user.notificationPreferences.campNotifications = campNotifications;
        if (systemNotifications !== undefined) user.notificationPreferences.systemNotifications = systemNotifications;

        await user.save();

        res.status(200).json({
            message: 'Notification preferences updated successfully',
            preferences: user.notificationPreferences,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
    try {
        const { userId } = req.params;

        const User = require('../schemas/UserSchema');
        const user = await User.findById(userId).select('notificationPreferences fcmTokens');

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                statusCode: 404 
            });
        }

        res.status(200).json({
            message: 'Notification preferences retrieved successfully',
            preferences: user.notificationPreferences,
            fcmTokenCount: user.fcmTokens ? user.fcmTokens.length : 0,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Send test push notification
const sendTestPushNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                message: 'User ID is required', 
                statusCode: 400 
            });
        }

        const User = require('../schemas/UserSchema');
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found', 
                statusCode: 404 
            });
        }

        if (!user.fcmTokens || user.fcmTokens.length === 0) {
            return res.status(400).json({ 
                message: 'No FCM tokens found for this user', 
                statusCode: 400 
            });
        }

        // Get active tokens
        const activeTokens = user.fcmTokens
            .filter(tokenObj => {
                const daysSinceLastUsed = (Date.now() - tokenObj.lastUsed) / (1000 * 60 * 60 * 24);
                return daysSinceLastUsed <= 30;
            })
            .map(tokenObj => tokenObj.token);

        if (activeTokens.length === 0) {
            return res.status(400).json({ 
                message: 'No active FCM tokens found for this user', 
                statusCode: 400 
            });
        }

        const result = await firebaseService.sendPushNotificationToMultiple(
            activeTokens,
            title || '🧪 Test Notification',
            message || 'This is a test push notification from Blood Donation App',
            {
                type: 'test',
                userId: userId
            }
        );

        res.status(200).json({
            message: 'Test push notification sent',
            result: result,
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
    getAllBloodRequestNotifications,
    registerFCMToken,
    removeFCMToken,
    updateNotificationPreferences,
    getNotificationPreferences,
    sendTestPushNotification
};
