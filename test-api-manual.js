// Simple test to check if the notification API works
const axios = require('axios');

async function testNotificationAPI() {
    const BASE_URL = 'http://localhost:5000/api/v1';
    
    // Test data from our verification
    const adminUserId = '69116508732d4ecf759394eb';
    const regularUserId = '691167b315556afbaad4c06f';
    
    console.log('Testing notification API...\n');
    
    try {
        // Test admin user notifications
        console.log('1. Testing admin user notifications:');
        const adminResponse = await axios.get(`${BASE_URL}/notifications/get-by-user/${adminUserId}`);
        console.log(`   - Status: ${adminResponse.status}`);
        console.log(`   - Count: ${adminResponse.data.count}`);
        console.log(`   - Notifications: ${adminResponse.data.notifications.map(n => n.type).join(', ')}`);
        
        // Test regular user notifications  
        console.log('\n2. Testing regular user notifications:');
        const userResponse = await axios.get(`${BASE_URL}/notifications/get-by-user/${regularUserId}`);
        console.log(`   - Status: ${userResponse.status}`);
        console.log(`   - Count: ${userResponse.data.count}`);
        console.log(`   - Notifications: ${userResponse.data.notifications.map(n => n.type).join(', ')}`);
        
        console.log('\n✅ API test successful!');
        
    } catch (error) {
        console.log('\n❌ API test failed:');
        console.log('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🔧 Make sure the backend server is running on port 5000');
        }
    }
}

// Run if backend is available, otherwise just show what should work
testNotificationAPI().catch(() => {
    console.log('Backend not available - showing expected API behavior:');
    console.log('GET /api/v1/notifications/get-by-user/69116508732d4ecf759394eb');
    console.log('Expected: 3 notifications (donation_reminder, blood-request, general)');
    console.log('GET /api/v1/notifications/get-by-user/691167b315556afbaad4c06f');  
    console.log('Expected: 3 notifications (donation_reminder, blood-request, general)');
});