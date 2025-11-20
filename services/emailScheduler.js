const cron = require('node-cron');
const Camp = require('../schemas/CampSchema');
const CampRegistration = require('../schemas/CampRegistrationSchema');
const User = require('../schemas/UserSchema');
const { sendWeekReminder, sendNextDonationReminder } = require('./emailService');

// Schedule email reminders
const scheduleEmailReminders = () => {
    // Run every day at 9:00 AM to check for reminders
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily email reminder check...');
        
        try {
            // Get current date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check for camps happening in exactly 7 days (week reminder)
            const weekFromToday = new Date(today);
            weekFromToday.setDate(weekFromToday.getDate() + 7);
            weekFromToday.setHours(23, 59, 59, 999);

            const weekReminderCamps = await Camp.find({
                date: {
                    $gte: weekFromToday.setHours(0, 0, 0, 0),
                    $lte: weekFromToday.setHours(23, 59, 59, 999)
                }
            });

            // Send week reminder emails
            for (const camp of weekReminderCamps) {
                const registrations = await CampRegistration.find({ campId: camp._id }).populate('userId');
                
                for (const registration of registrations) {
                    if (registration.userId && registration.userId.email) {
                        try {
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

                            const emailResult = await sendWeekReminder(
                                registration.userId.email,
                                registration.userId.name,
                                campDetails
                            );

                            if (emailResult.success) {
                                console.log(`Week reminder sent to ${registration.userId.email} for camp ${camp.campName}`);
                            } else {
                                console.error(`Failed to send week reminder to ${registration.userId.email}:`, emailResult.error);
                            }
                        } catch (error) {
                            console.error(`Error sending week reminder to ${registration.userId.email}:`, error);
                        }
                    }
                }
            }

            // Check for camps that happened yesterday (next donation reminder)
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const yesterdayEnd = new Date(yesterday);
            yesterdayEnd.setHours(23, 59, 59, 999);

            const yesterdayCamps = await Camp.find({
                date: {
                    $gte: yesterday,
                    $lte: yesterdayEnd
                }
            });

            // Send next donation reminder emails
            for (const camp of yesterdayCamps) {
                const registrations = await CampRegistration.find({ campId: camp._id }).populate('userId');
                
                for (const registration of registrations) {
                    if (registration.userId && registration.userId.email) {
                        try {
                            // Calculate next donation date (4 months after camp)
                            const campDate = new Date(camp.date);
                            const nextDonationDate = new Date(campDate);
                            nextDonationDate.setMonth(nextDonationDate.getMonth() + 4);

                            const formattedNextDate = nextDonationDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            });

                            const emailResult = await sendNextDonationReminder(
                                registration.userId.email,
                                registration.userId.name,
                                formattedNextDate
                            );

                            if (emailResult.success) {
                                console.log(`Next donation reminder sent to ${registration.userId.email} for camp ${camp.campName}`);
                            } else {
                                console.error(`Failed to send next donation reminder to ${registration.userId.email}:`, emailResult.error);
                            }
                        } catch (error) {
                            console.error(`Error sending next donation reminder to ${registration.userId.email}:`, error);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error in email reminder scheduler:', error);
        }
    });

    console.log('Email reminder scheduler initialized. Reminders will be sent daily at 9:00 AM.');
};

// Manual function to send week reminders for testing
const sendWeekRemindersNow = async () => {
    try {
        const today = new Date();
        const weekFromToday = new Date(today);
        weekFromToday.setDate(weekFromToday.getDate() + 7);

        const camps = await Camp.find({
            date: {
                $gte: weekFromToday.setHours(0, 0, 0, 0),
                $lte: weekFromToday.setHours(23, 59, 59, 999)
            }
        });

        console.log(`Found ${camps.length} camps happening in a week`);

        for (const camp of camps) {
            const registrations = await CampRegistration.find({ campId: camp._id }).populate('userId');
            console.log(`Sending reminders to ${registrations.length} registered users for ${camp.campName}`);
            
            for (const registration of registrations) {
                if (registration.userId && registration.userId.email) {
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

                    const result = await sendWeekReminder(
                        registration.userId.email,
                        registration.userId.name,
                        campDetails
                    );

                    console.log(`Week reminder result for ${registration.userId.email}:`, result);
                }
            }
        }

        return { success: true, message: `Processed ${camps.length} camps` };
    } catch (error) {
        console.error('Error sending week reminders:', error);
        return { success: false, error: error.message };
    }
};

// Manual function to send next donation reminders for testing
const sendNextDonationRemindersNow = async () => {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const camps = await Camp.find({
            date: {
                $gte: yesterday.setHours(0, 0, 0, 0),
                $lte: yesterday.setHours(23, 59, 59, 999)
            }
        });

        console.log(`Found ${camps.length} camps that happened yesterday`);

        for (const camp of camps) {
            const registrations = await CampRegistration.find({ campId: camp._id }).populate('userId');
            console.log(`Sending next donation reminders to ${registrations.length} users for ${camp.campName}`);
            
            for (const registration of registrations) {
                if (registration.userId && registration.userId.email) {
                    const campDate = new Date(camp.date);
                    const nextDonationDate = new Date(campDate);
                    nextDonationDate.setMonth(nextDonationDate.getMonth() + 4);

                    const formattedNextDate = nextDonationDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });

                    const result = await sendNextDonationReminder(
                        registration.userId.email,
                        registration.userId.name,
                        formattedNextDate
                    );

                    console.log(`Next donation reminder result for ${registration.userId.email}:`, result);
                }
            }
        }

        return { success: true, message: `Processed ${camps.length} camps` };
    } catch (error) {
        console.error('Error sending next donation reminders:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    scheduleEmailReminders,
    sendWeekRemindersNow,
    sendNextDonationRemindersNow
};