/**
 * Test script for forgot password functionality
 * Run this after setting up your email configuration
 * 
 * Usage: node test-forgot-password.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1/users';

// Test user email - change this to a real email for testing
const TEST_EMAIL = 'test@example.com';

async function testForgotPassword() {
    console.log('🧪 Testing Forgot Password API...\n');
    
    try {
        console.log('📧 Sending forgot password request...');
        const response = await axios.post(`${BASE_URL}/forgot-password`, {
            email: TEST_EMAIL
        });
        
        console.log('✅ Success!');
        console.log('Response:', response.data);
        console.log('\n📬 Check your email for the reset link!');
        
    } catch (error) {
        console.log('❌ Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

async function testResetPassword() {
    console.log('\n🔄 Testing Reset Password API...\n');
    
    // Note: You need to get the actual token from the email
    const TOKEN_FROM_EMAIL = 'paste-token-from-email-here';
    const NEW_PASSWORD = 'newpassword123';
    
    if (TOKEN_FROM_EMAIL === 'paste-token-from-email-here') {
        console.log('⚠️  To test reset password:');
        console.log('1. First run the forgot password test');
        console.log('2. Check your email for the reset link');
        console.log('3. Copy the token from the URL');
        console.log('4. Replace TOKEN_FROM_EMAIL in this script');
        console.log('5. Run this test again');
        return;
    }
    
    try {
        console.log('🔐 Resetting password...');
        const response = await axios.post(`${BASE_URL}/reset-password`, {
            token: TOKEN_FROM_EMAIL,
            password: NEW_PASSWORD
        });
        
        console.log('✅ Password reset successful!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

async function runTests() {
    console.log('🩸 Blood Donation App - Forgot Password API Tests\n');
    console.log('Make sure your server is running on http://localhost:5000\n');
    
    // Test forgot password
    await testForgotPassword();
    
    // Test reset password
    await testResetPassword();
    
    console.log('\n📝 Notes:');
    console.log('- Make sure you have configured EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('- Use a real email address for testing');
    console.log('- Check spam folder if email doesn\'t arrive');
    console.log('- Reset tokens expire in 1 hour');
}

// Run the tests
runTests().catch(console.error);