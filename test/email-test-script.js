/**
 * Email Testing Script for Blood Donation App
 * 
 * This script provides a comprehensive testing suite for all email functionalities
 * Run this script to test email services independently of the API
 * 
 * Usage: node test/email-test-script.js
 * Make sure your .env file has EMAIL_USER and EMAIL_PASSWORD configured
 */

const { sendRegistrationConfirmation, sendWeekReminder, sendNextDonationReminder, sendEmail } = require('../services/emailService');
const { sendWeekRemindersNow, sendNextDonationRemindersNow } = require('../services/emailScheduler');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
    // Replace with your test email address
    testEmail: 'tasheelajay1999@gmail.com',
    testUserName: 'John Doe',
    // Sample camp details for testing
    sampleCampDetails: {
        campName: 'Downtown Blood Drive',
        date: 'Friday, December 1, 2025',
        time: '9:00 AM - 5:00 PM',
        place: 'Community Center, 123 Main Street'
    }
};

// ANSI color codes for better console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Helper functions
const log = (message, color = colors.reset) => {
    console.log(`${color}${message}${colors.reset}`);
};

const logHeader = (title) => {
    log(`\n${'='.repeat(60)}`, colors.cyan);
    log(`  ${title}`, colors.bright + colors.cyan);
    log(`${'='.repeat(60)}`, colors.cyan);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logWarning = (message) => log(`⚠️  ${message}`, colors.yellow);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);

// Test email configuration
const testEmailConfiguration = () => {
    logHeader('EMAIL CONFIGURATION TEST');
    
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    if (!emailUser) {
        logError('EMAIL_USER is not configured in .env file');
        return false;
    } else {
        logSuccess(`EMAIL_USER is configured: ${emailUser}`);
    }
    
    if (!emailPassword) {
        logError('EMAIL_PASSWORD is not configured in .env file');
        return false;
    } else {
        logSuccess('EMAIL_PASSWORD is configured');
    }
    
    logInfo('Email configuration appears to be correct');
    logWarning('Make sure to use App Password for Gmail, not your regular password');
    return true;
};

// Test registration confirmation email
const testRegistrationConfirmation = async () => {
    logHeader('REGISTRATION CONFIRMATION EMAIL TEST');
    
    try {
        logInfo(`Sending registration confirmation to: ${TEST_CONFIG.testEmail}`);
        
        const result = await sendRegistrationConfirmation(
            TEST_CONFIG.testEmail,
            TEST_CONFIG.testUserName,
            TEST_CONFIG.sampleCampDetails
        );
        
        if (result.success) {
            logSuccess('Registration confirmation email sent successfully');
            logInfo(`Message ID: ${result.messageId}`);
            return true;
        } else {
            logError(`Registration confirmation email failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        logError(`Exception in registration confirmation test: ${error.message}`);
        return false;
    }
};

// Test week reminder email
const testWeekReminder = async () => {
    logHeader('WEEK REMINDER EMAIL TEST');
    
    try {
        logInfo(`Sending week reminder to: ${TEST_CONFIG.testEmail}`);
        
        const result = await sendWeekReminder(
            TEST_CONFIG.testEmail,
            TEST_CONFIG.testUserName,
            TEST_CONFIG.sampleCampDetails
        );
        
        if (result.success) {
            logSuccess('Week reminder email sent successfully');
            logInfo(`Message ID: ${result.messageId}`);
            return true;
        } else {
            logError(`Week reminder email failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        logError(`Exception in week reminder test: ${error.message}`);
        return false;
    }
};

// Test next donation reminder email
const testNextDonationReminder = async () => {
    logHeader('NEXT DONATION REMINDER EMAIL TEST');

    try {
        logInfo(`Sending next donation reminder to: ${TEST_CONFIG.testEmail}`);

        // Calculate next donation date: camp registration date + 6 months
        // Parse the camp date string (e.g., 'Friday, December 1, 2025')
        const campDateStr = TEST_CONFIG.sampleCampDetails.date;
        const campDate = new Date(campDateStr.replace(/^[^,]*, /, ''));
        if (isNaN(campDate.getTime())) {
            logError('Could not parse camp date for next donation calculation.');
            return false;
        }
        const nextDonationDateObj = new Date(campDate);
        nextDonationDateObj.setMonth(nextDonationDateObj.getMonth() + 6);
        // Format as e.g., 'Monday, June 1, 2026'
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const nextDonationDate = nextDonationDateObj.toLocaleDateString('en-US', options);

        const result = await sendNextDonationReminder(
            TEST_CONFIG.testEmail,
            TEST_CONFIG.testUserName,
            nextDonationDate
        );

        if (result.success) {
            logSuccess('Next donation reminder email sent successfully');
            logInfo(`Message ID: ${result.messageId}`);
            return true;
        } else {
            logError(`Next donation reminder email failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        logError(`Exception in next donation reminder test: ${error.message}`);
        return false;
    }
};

// Test custom email
const testCustomEmail = async () => {
    logHeader('CUSTOM EMAIL TEST');
    
    try {
        const customTemplate = {
            subject: '🧪 Email Service Test - Custom Email',
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #CD2F2F;">🧪 Email Service Test</h2>
                    <p>Dear ${TEST_CONFIG.testUserName},</p>
                    <p>This is a test email to verify that the custom email functionality is working properly.</p>
                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Test Details:</strong></p>
                        <ul>
                            <li>Test performed at: ${new Date().toLocaleString()}</li>
                            <li>Email service: Gmail via Nodemailer</li>
                            <li>Test type: Custom email template</li>
                        </ul>
                    </div>
                    <p>If you received this email, the email service is working correctly! ✅</p>
                    <p>Best regards,<br>Blood Donation App Email Test Suite</p>
                </div>
            `
        };
        
        logInfo(`Sending custom email to: ${TEST_CONFIG.testEmail}`);
        
        const result = await sendEmail(TEST_CONFIG.testEmail, customTemplate);
        
        if (result.success) {
            logSuccess('Custom email sent successfully');
            logInfo(`Message ID: ${result.messageId}`);
            return true;
        } else {
            logError(`Custom email failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        logError(`Exception in custom email test: ${error.message}`);
        return false;
    }
};

// Test email delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Run comprehensive email tests
const runAllTests = async () => {
    logHeader('🩸 BLOOD DONATION APP - EMAIL TESTING SUITE');
    logInfo('Starting comprehensive email functionality tests...\n');
    
    // Check configuration first
    const configOk = testEmailConfiguration();
    if (!configOk) {
        logError('Email configuration issues detected. Please fix before proceeding.');
        process.exit(1);
    }
    
    // Test results tracking
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // Define tests
    const tests = [
        { name: 'Registration Confirmation Email', fn: testRegistrationConfirmation },
        { name: 'Week Reminder Email', fn: testWeekReminder },
        { name: 'Next Donation Reminder Email', fn: testNextDonationReminder },
        { name: 'Custom Email', fn: testCustomEmail }
    ];
    
    // Run each test with delay
    for (const test of tests) {
        results.total++;
        
        try {
            const success = await test.fn();
            if (success) {
                results.passed++;
                results.tests.push({ name: test.name, status: 'PASSED' });
            } else {
                results.failed++;
                results.tests.push({ name: test.name, status: 'FAILED' });
            }
        } catch (error) {
            results.failed++;
            results.tests.push({ name: test.name, status: 'ERROR', error: error.message });
            logError(`Unexpected error in ${test.name}: ${error.message}`);
        }
        
        // Add delay between tests to avoid rate limiting
        if (tests.indexOf(test) < tests.length - 1) {
            logInfo('Waiting 3 seconds before next test...');
            await delay(3000);
        }
    }
    
    // Display final results
    logHeader('TEST RESULTS SUMMARY');
    
    log(`Total Tests: ${results.total}`, colors.bright);
    logSuccess(`Passed: ${results.passed}`);
    if (results.failed > 0) {
        logError(`Failed: ${results.failed}`);
    }
    
    log('\nDetailed Results:', colors.bright);
    results.tests.forEach((test, index) => {
        const statusColor = test.status === 'PASSED' ? colors.green : colors.red;
        log(`${index + 1}. ${test.name}: ${statusColor}${test.status}${colors.reset}`);
        if (test.error) {
            log(`   Error: ${test.error}`, colors.red);
        }
    });
    
    // Recommendations
    log('\nRecommendations:', colors.bright + colors.yellow);
    if (results.passed === results.total) {
        logSuccess('All tests passed! Your email service is working perfectly.');
        logInfo('You can now safely use all email features in your application.');
    } else {
        logWarning('Some tests failed. Please check the following:');
        log('  • Verify EMAIL_USER and EMAIL_PASSWORD in .env file');
        log('  • Ensure you\'re using an App Password for Gmail (not regular password)');
        log('  • Check your internet connection');
        log('  • Verify the test email address is correct');
        log('  • Check Gmail\'s sending limits (you might have hit rate limits)');
    }
    
    logInfo(`\nFor more detailed testing, you can use the API endpoints at:`);
    logInfo(`  POST /api/v1/email-test/test-registration-confirmation`);
    logInfo(`  POST /api/v1/email-test/test-week-reminder`);
    logInfo(`  POST /api/v1/email-test/test-next-donation-reminder`);
    logInfo(`  POST /api/v1/email-test/test-all-emails`);
    logInfo(`  GET  /api/v1/email-test/test-email-config`);
    
    log('\n' + '='.repeat(60), colors.cyan);
    log('Email testing completed.', colors.bright + colors.cyan);
    log('='.repeat(60), colors.cyan);
};

// Command line argument processing
const args = process.argv.slice(2);

if (args.length === 0) {
    // Run all tests if no arguments provided
    runAllTests().catch(error => {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    });
} else {
    // Handle specific test commands
    const command = args[0].toLowerCase();
    
    switch (command) {
        case 'config':
            testEmailConfiguration();
            break;
        case 'registration':
            testRegistrationConfirmation().catch(error => logError(error.message));
            break;
        case 'week-reminder':
            testWeekReminder().catch(error => logError(error.message));
            break;
        case 'next-donation':
            testNextDonationReminder().catch(error => logError(error.message));
            break;
        case 'custom':
            testCustomEmail().catch(error => logError(error.message));
            break;
        case 'help':
            logHeader('EMAIL TEST SCRIPT USAGE');
            log('Usage: node test/email-test-script.js [command]');
            log('\nCommands:');
            log('  (no args)     Run all email tests');
            log('  config        Test email configuration only');
            log('  registration  Test registration confirmation email');
            log('  week-reminder Test week reminder email');
            log('  next-donation Test next donation reminder email');
            log('  custom        Test custom email');
            log('  help          Show this help message');
            log('\nBefore running tests:');
            log('  1. Configure EMAIL_USER and EMAIL_PASSWORD in .env file');
            log('  2. Update TEST_CONFIG.testEmail with your test email address');
            log('  3. Ensure your server environment is set up correctly');
            break;
        default:
            logError(`Unknown command: ${command}`);
            logInfo('Use "node test/email-test-script.js help" for usage information');
    }
}