// Quick test for notification API
async function testNotificationAPI() {
    const userId = "691167b315556afbaad4c06f"; // Tasheela's user ID from our test
    const apiUrl = `http://localhost:5000/api/v1/notifications/get-by-user/${userId}`;
    
    console.log('Testing API endpoint:', apiUrl);
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Number of notifications:', data.notifications?.length || 0);
    } catch (error) {
        console.error('API Error:', error);
    }
}

// Test the API
testNotificationAPI();