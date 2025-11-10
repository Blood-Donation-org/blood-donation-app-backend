const mongoose = require('mongoose');
const Notification = require('./schemas/NotificationSchema');
const User = require('./schemas/UserSchema');
require('dotenv').config();

async function testUserSpecificNotifications() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find();
        console.log('\n=== TESTING USER-SPECIFIC NOTIFICATION ISOLATION ===\n');

        for (const user of users) {
            console.log(`\n--- Testing User: ${user.fullName} (${user._id}) ---`);
            
            // Get notifications for this specific user using the same query as the API
            const userNotifications = await Notification.find({ user: user._id })
                .populate('user', 'fullName email role')
                .sort({ createdAt: -1 });

            console.log(`Found ${userNotifications.length} notifications for ${user.fullName}`);
            
            // Verify all notifications belong to this user
            const allBelongToUser = userNotifications.every(n => n.user._id.toString() === user._id.toString());
            
            if (allBelongToUser) {
                console.log('✅ All notifications correctly belong to this user');
            } else {
                console.log('❌ SECURITY ISSUE: Found notifications that do NOT belong to this user!');
            }

            // Show notification details
            userNotifications.forEach(n => {
                console.log(`  - ${n.type}: ${n.message.substring(0, 50)}... (User: ${n.user.fullName})`);
            });
        }

        // Cross-check: Make sure user A doesn't see user B's notifications
        if (users.length >= 2) {
            const userA = users[0];
            const userB = users[1];
            
            console.log(`\n\n=== CROSS-CHECK: User isolation ===`);
            console.log(`User A: ${userA.fullName} (${userA._id})`);
            console.log(`User B: ${userB.fullName} (${userB._id})`);
            
            const userANotifications = await Notification.find({ user: userA._id });
            const userBNotifications = await Notification.find({ user: userB._id });
            
            console.log(`User A has ${userANotifications.length} notifications`);
            console.log(`User B has ${userBNotifications.length} notifications`);
            
            // Check if any of A's notifications accidentally include B's user ID
            const leakFromBtoA = userANotifications.some(n => n.user.toString() === userB._id.toString());
            const leakFromAtoB = userBNotifications.some(n => n.user.toString() === userA._id.toString());
            
            if (!leakFromBtoA && !leakFromAtoB) {
                console.log('✅ User isolation is working correctly - no cross-user notifications found');
            } else {
                console.log('❌ SECURITY ISSUE: Cross-user notification leak detected!');
                if (leakFromBtoA) console.log('  - User A can see User B notifications');
                if (leakFromAtoB) console.log('  - User B can see User A notifications');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

testUserSpecificNotifications();