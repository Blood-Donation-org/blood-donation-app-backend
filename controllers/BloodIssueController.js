const BloodIssue = require('../schemas/BloodIssueSchema');
const BloodInventory = require('../schemas/BloodInventorySchema');

// Issue blood and save transaction
const issueBlood = async (req, res) => {
    try {
        const { bloodType, unitsToIssue, requestId, doctorName, patientName, reason } = req.body;
        // Find inventory for the blood type
        const inventory = await BloodInventory.findOne({ bloodType });
        if (!inventory) {
            return res.status(404).json({ message: 'Blood type not found in inventory', statusCode: 404 });
        }
        if (inventory.units < unitsToIssue) {
            return res.status(400).json({ message: 'Not enough units in stock', availableUnits: inventory.units, statusCode: 400 });
        }
        // Deduct units
        inventory.units -= unitsToIssue;
        await inventory.save();
        // Save issue transaction
        const bloodIssue = new BloodIssue({
            bloodType,
            unitsIssued: unitsToIssue,
            remainingUnits: inventory.units,
            requestId,
            doctorName,
            patientName,
            reason
        });
        await bloodIssue.save();
        res.status(201).json({
            message: 'Blood issued and transaction saved successfully',
            bloodIssue: {
                id: bloodIssue._id,
                bloodType: bloodIssue.bloodType,
                unitsIssued: bloodIssue.unitsIssued,
                remainingUnits: bloodIssue.remainingUnits,
                requestId: bloodIssue.requestId,
                doctorName: bloodIssue.doctorName,
                patientName: bloodIssue.patientName,
                reason: bloodIssue.reason,
                createdAt: bloodIssue.createdAt,
                updatedAt: bloodIssue.updatedAt
            },
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all blood issue transactions
const getAllBloodIssues = async (req, res) => {
    try {
        const issues = await BloodIssue.find();
        res.status(200).json({
            message: 'Blood issue transactions retrieved successfully',
            bloodIssues: issues.map(issue => ({
                id: issue._id,
                bloodType: issue.bloodType,
                unitsIssued: issue.unitsIssued,
                remainingUnits: issue.remainingUnits,
                requestId: issue.requestId,
                doctorName: issue.doctorName,
                patientName: issue.patientName,
                reason: issue.reason,
                createdAt: issue.createdAt,
                updatedAt: issue.updatedAt
            })),
            count: issues.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = { issueBlood, getAllBloodIssues };
