const mongoose = require('mongoose');
const Notification = require('./schemas/NotificationSchema');
const User = require('./schemas/UserSchema');
require('dotenv').config();

async function createTestNotifications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('Connected to MongoDB');

        // Find a user to create notifications for
        const users = await User.find().limit(3);
        console.log('Found users:', users.map(u => ({ id: u._id, email: u.email, name: u.fullName })));

        if (users.length === 0) {
            console.log('No users found in the database');
            return;
        }

        // Clear existing notifications
        await Notification.deleteMany({});
        console.log('Cleared existing notifications');

        // Create test notifications for each user
        for (const user of users) {
            const notifications = [
                {
                    user: user._id,
                    type: 'donation_reminder',
                    message: `Hi ${user.fullName}, it's time for your next blood donation!`,
                    status: 'unread'
                },
                {
                    user: user._id,
                    type: 'blood-request',
                    message: `Blood request notification for ${user.fullName}`,
                    status: 'unread'
                },
                {
                    user: user._id,
                    type: 'general',
                    message: `General notification for ${user.fullName}`,
                    status: 'read'
                }
            ];

            await Notification.insertMany(notifications);
            console.log(`Created ${notifications.length} test notifications for user ${user.fullName} (ID: ${user._id})`);
        }

        console.log('Test notifications created successfully!');
        
        // Verify the notifications were created
        const allNotifications = await Notification.find().populate('user', 'fullName email');
        console.log('\nAll notifications in database:');
        allNotifications.forEach(n => {
            console.log(`- ${n.user.fullName}: ${n.type} - ${n.message} (${n.status})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

createTestNotifications();