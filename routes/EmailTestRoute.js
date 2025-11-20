const express = require('express');
const { sendWeekRemindersNow, sendNextDonationRemindersNow } = require('../services/emailScheduler');

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

module.exports = router;