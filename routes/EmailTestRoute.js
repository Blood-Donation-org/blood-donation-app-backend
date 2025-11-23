const express = require('express');
const { sendWeekRemindersNow, sendNextDonationRemindersNow } = require('../services/emailScheduler');
const { sendRegistrationConfirmation, sendWeekReminder, sendNextDonationReminder, sendEmail } = require('../services/emailService');
const User = require('../schemas/UserSchema');
const Camp = require('../schemas/CampSchema');

const router = express.Router();

// Test route to send week reminders manually
router.post('/send-week-reminders', async (req, res) => {
    try {
        const result = await sendWeekRemindersNow();
        res.status(200).json({
            message: 'Week reminders process completed',
            result: result,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending week reminders',
            error: error.message,
            statusCode: 500
        });
    }
});

// Test route to send next donation reminders manually
router.post('/send-next-donation-reminders', async (req, res) => {
    try {
        const result = await sendNextDonationRemindersNow();
        res.status(200).json({
            message: 'Next donation reminders process completed',
            result: result,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending next donation reminders',
            error: error.message,
            statusCode: 500
        });
    }
});

// Test registration confirmation email
router.post('/test-registration-confirmation', async (req, res) => {
    try {
        const { email, userName, campId } = req.body;
        
        if (!email || !userName || !campId) {
            return res.status(400).json({
                message: 'email, userName, and campId are required',
                statusCode: 400
            });
        }

        // Get camp details
        const camp = await Camp.findById(campId);
        if (!camp) {
            return res.status(404).json({
                message: 'Camp not found',
                statusCode: 404
            });
        }

        const campDetails = {
            campName: camp.campName,
            date: new Date(camp.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: camp.time || 'All Day',
            place: camp.place
        };

        const result = await sendRegistrationConfirmation(email, userName, campDetails);
        
        res.status(200).json({
            message: 'Registration confirmation email test completed',
            result: result,
            campDetails: campDetails,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending registration confirmation email',
            error: error.message,
            statusCode: 500
        });
    }
});

// Test week reminder email
router.post('/test-week-reminder', async (req, res) => {
    try {
        const { email, userName, campId } = req.body;
        
        if (!email || !userName || !campId) {
            return res.status(400).json({
                message: 'email, userName, and campId are required',
                statusCode: 400
            });
        }

        // Get camp details
        const camp = await Camp.findById(campId);
        if (!camp) {
            return res.status(404).json({
                message: 'Camp not found',
                statusCode: 404
            });
        }

        const campDetails = {
            campName: camp.campName,
            date: new Date(camp.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: camp.time || 'All Day',
            place: camp.place
        };

        const result = await sendWeekReminder(email, userName, campDetails);
        
        res.status(200).json({
            message: 'Week reminder email test completed',
            result: result,
            campDetails: campDetails,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending week reminder email',
            error: error.message,
            statusCode: 500
        });
    }
});

// Test next donation reminder email
router.post('/test-next-donation-reminder', async (req, res) => {
    try {
        const { email, userName, nextDonationDate } = req.body;
        
        if (!email || !userName) {
            return res.status(400).json({
                message: 'email and userName are required',
                statusCode: 400
            });
        }

        // Use provided date or calculate 4 months from now
        let formattedNextDate;
        if (nextDonationDate) {
            formattedNextDate = new Date(nextDonationDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } else {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 4);
            formattedNextDate = futureDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }

        const result = await sendNextDonationReminder(email, userName, formattedNextDate);
        
        res.status(200).json({
            message: 'Next donation reminder email test completed',
            result: result,
            nextDonationDate: formattedNextDate,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending next donation reminder email',
            error: error.message,
            statusCode: 500
        });
    }
});

// Test custom email
router.post('/test-custom-email', async (req, res) => {
    try {
        const { email, subject, htmlContent } = req.body;
        
        if (!email || !subject || !htmlContent) {
            return res.status(400).json({
                message: 'email, subject, and htmlContent are required',
                statusCode: 400
            });
        }

        const customTemplate = {
            subject: subject,
            html: htmlContent
        };

        const result = await sendEmail(email, customTemplate);
        
        res.status(200).json({
            message: 'Custom email test completed',
            result: result,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending custom email',
            error: error.message,
            statusCode: 500
        });
    }
});

// Test all email types to a specific user
router.post('/test-all-emails', async (req, res) => {
    try {
        const { email, userName, campId } = req.body;
        
        if (!email || !userName || !campId) {
            return res.status(400).json({
                message: 'email, userName, and campId are required',
                statusCode: 400
            });
        }

        // Get camp details
        const camp = await Camp.findById(campId);
        if (!camp) {
            return res.status(404).json({
                message: 'Camp not found',
                statusCode: 404
            });
        }

        const campDetails = {
            campName: camp.campName,
            date: new Date(camp.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: camp.time || 'All Day',
            place: camp.place
        };

        // Calculate next donation date
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 4);
        const formattedNextDate = futureDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const results = {};

        // Test registration confirmation
        try {
            results.registrationConfirmation = await sendRegistrationConfirmation(email, userName, campDetails);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        } catch (error) {
            results.registrationConfirmation = { success: false, error: error.message };
        }

        // Test week reminder
        try {
            results.weekReminder = await sendWeekReminder(email, userName, campDetails);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        } catch (error) {
            results.weekReminder = { success: false, error: error.message };
        }

        // Test next donation reminder
        try {
            results.nextDonationReminder = await sendNextDonationReminder(email, userName, formattedNextDate);
        } catch (error) {
            results.nextDonationReminder = { success: false, error: error.message };
        }

        const successCount = Object.values(results).filter(r => r.success).length;
        const totalCount = Object.keys(results).length;

        res.status(200).json({
            message: `All email tests completed: ${successCount}/${totalCount} successful`,
            results: results,
            summary: {
                total: totalCount,
                successful: successCount,
                failed: totalCount - successCount
            },
            campDetails: campDetails,
            nextDonationDate: formattedNextDate,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error testing all emails',
            error: error.message,
            statusCode: 500
        });
    }
});

// Get available camps for testing
router.get('/available-camps', async (req, res) => {
    try {
        const camps = await Camp.find().sort({ date: 1 });
        
        res.status(200).json({
            message: 'Available camps retrieved successfully',
            camps: camps.map(camp => ({
                id: camp._id,
                campName: camp.campName,
                date: camp.date,
                time: camp.time,
                place: camp.place,
                formattedDate: new Date(camp.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            })),
            count: camps.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving camps',
            error: error.message,
            statusCode: 500
        });
    }
});

// Email configuration test
router.get('/test-email-config', async (req, res) => {
    try {
        const config = {
            emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
            emailPassword: process.env.EMAIL_PASSWORD ? 'Configured' : 'Not configured',
            nodemailerService: 'Gmail (hardcoded)',
            requiredEnvVars: {
                EMAIL_USER: !!process.env.EMAIL_USER,
                EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
            }
        };

        const isConfigured = config.requiredEnvVars.EMAIL_USER && config.requiredEnvVars.EMAIL_PASSWORD;

        res.status(200).json({
            message: 'Email configuration status',
            config: config,
            isFullyConfigured: isConfigured,
            recommendations: isConfigured ? 
                ['Email configuration looks good! You can proceed with testing.'] :
                [
                    'Make sure EMAIL_USER is set in your .env file',
                    'Make sure EMAIL_PASSWORD is set in your .env file (use App Password for Gmail)',
                    'Restart your server after updating .env file'
                ],
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error checking email configuration',
            error: error.message,
            statusCode: 500
        });
    }
});

module.exports = router;