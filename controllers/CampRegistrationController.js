const Camp = require('../schemas/CampSchema');
const CampRegistration = require('../schemas/CampRegistrationSchema');

// Register a user for a camp
const registerForACamp = async (req, res) => {
    try {
        const { userId, campId } = req.body;
        if (!userId || !campId) {
            return res.status(400).json({ message: 'userId and campId are required', statusCode: 400 });
        }
        // Optionally check if camp exists
        const camp = await Camp.findById(campId);
        if (!camp) {
            return res.status(404).json({ message: 'Camp not found', statusCode: 404 });
        }
        // Optionally check if already registered
        const alreadyRegistered = await CampRegistration.findOne({ userId, campId });
        if (alreadyRegistered) {
            return res.status(409).json({ message: 'User already registered for this camp', statusCode: 409 });
        }
        const registration = new CampRegistration({ userId, campId });
        await registration.save();

        // Calculate next donation date (4 months after camp start date)
        let campDate = camp.date;
        // If camp.date is a string, convert to Date
        if (typeof campDate === 'string') {
            campDate = new Date(campDate);
        }
        const nextDonationDate = new Date(campDate);
        nextDonationDate.setMonth(nextDonationDate.getMonth() + 4);

        // Create notification for next donation date
        const Notification = require('../schemas/NotificationSchema');
        const notification = new Notification({
            user: userId,
            type: 'donation_reminder',
            message: `You are eligible to donate blood again on ${nextDonationDate.toLocaleDateString()}`,
            status: 'unread',
            // Optionally store nextDonationDate in notification if schema is extended
            nextDonationDate
        });
        await notification.save();

        res.status(201).json({
            message: 'User registered for camp successfully',
            registration: {
                id: registration._id,
                userId: registration.userId,
                campId: registration.campId,
                createdAt: registration.createdAt,
                updatedAt: registration.updatedAt
            },
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all registrations for a user
const getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required', statusCode: 400 });
        }
        const registrations = await CampRegistration.find({ userId }).populate('campId').populate('userId');
        res.status(200).json({
            message: 'Registrations retrieved successfully',
            registrations: registrations.map(reg => ({
                id: reg._id,
                user: reg.userId,
                camp: reg.campId,
                createdAt: reg.createdAt,
                updatedAt: reg.updatedAt
            })),
            count: registrations.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all camp registrations
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await CampRegistration.find().populate('campId').populate('userId');
        res.status(200).json({
            message: 'All registrations retrieved successfully',
            registrations: registrations.map(reg => ({
                id: reg._id,
                user: reg.userId,
                camp: reg.campId,
                createdAt: reg.createdAt,
                updatedAt: reg.updatedAt
            })),
            count: registrations.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Check if a user is registered for a camp
const checkUserRegistration = async (req, res) => {
    try {
        const { userId, campId } = req.query;
        if (!userId || !campId) {
            return res.status(400).json({ message: 'userId and campId are required', statusCode: 400 });
        }
        const registration = await CampRegistration.findOne({ userId, campId });
        if (registration) {
            return res.status(200).json({ registered: true, registrationId: registration._id, statusCode: 200 });
        } else {
            return res.status(200).json({ registered: false, statusCode: 200 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = { registerForACamp, getByUser, getAllRegistrations, checkUserRegistration };
