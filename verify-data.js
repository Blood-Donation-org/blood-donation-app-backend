const mongoose = require('mongoose');
const Notification = require('./schemas/NotificationSchema');
const User = require('./schemas/UserSchema');
require('dotenv').config();

async function verifyNotificationsAndUsers() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find().limit(10);
        console.log('\n=== USERS IN DATABASE ===');
        users.forEach(user => {
            console.log(`ID: ${user._id} | Email: ${user.email} | Name: ${user.fullName} | Role: ${user.role}`);
        });

        // Get all notifications
        const notifications = await Notification.find().populate('user', 'fullName email');
        console.log('\n=== NOTIFICATIONS IN DATABASE ===');
        notifications.forEach(notification => {
            console.log(`ID: ${notification._id} | User: ${notification.user?.fullName || 'Unknown'} | Type: ${notification.type} | Status: ${notification.status}`);
        });

        // Check if notifications match users
        console.log('\n=== USER-NOTIFICATION MAPPING ===');
        for (const user of users) {
            const userNotifications = notifications.filter(n => n.user && n.user._id.toString() === user._id.toString());
            console.log(`User ${user.fullName} (${user._id}): ${userNotifications.length} notifications`);
            userNotifications.forEach(n => {
                console.log(`  - ${n.type}: ${n.message.substring(0, 50)}...`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

verifyNotificationsAndUsers();