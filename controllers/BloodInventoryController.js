const BloodInventory = require('../schemas/BloodInventorySchema');
const { validationResult } = require('express-validator');

// Create a new blood inventory entry or update units if bloodType exists
const createBloodInventory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }

        const {
            bloodType,
            units,
            donerName,
            donerphone,
            donerAge,
            donationDate,
            Notes = ''
        } = req.body;

        // Always create a new entry with unique bloodPacketId
        const bloodInventory = new BloodInventory({
            bloodType,
            units,
            donerName,
            donerphone,
            donerAge,
            donationDate,
            Notes
        });

        await bloodInventory.save();

        return res.status(201).json({
            message: 'Blood inventory entry created successfully',
            bloodInventory: {
                id: bloodInventory._id,
                bloodPacketId: bloodInventory.bloodPacketId,
                bloodType: bloodInventory.bloodType,
                units: bloodInventory.units,
                donerName: bloodInventory.donerName,
                donerphone: bloodInventory.donerphone,
                donerAge: bloodInventory.donerAge,
                donationDate: bloodInventory.donationDate,
                Notes: bloodInventory.Notes,
                createdAt: bloodInventory.createdAt,
                updatedAt: bloodInventory.updatedAt
            },
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Update a blood inventory entry
const updateBloodInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = {};
        const allowedFields = [
            'bloodType', 'units', 'donerName', 'donerphone', 'donerAge', 'donationDate', 'Notes'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        }

        const updatedBloodInventory = await BloodInventory.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedBloodInventory) {
            return res.status(404).json({ message: 'Blood inventory entry not found', statusCode: 404 });
        }

        res.status(200).json({
            message: 'Blood inventory entry updated successfully',
            bloodInventory: {
                id: updatedBloodInventory._id,
                bloodPacketId: updatedBloodInventory.bloodPacketId,
                bloodType: updatedBloodInventory.bloodType,
                units: updatedBloodInventory.units,
                donerName: updatedBloodInventory.donerName,
                donerphone: updatedBloodInventory.donerphone,
                donerAge: updatedBloodInventory.donerAge,
                donationDate: updatedBloodInventory.donationDate,
                Notes: updatedBloodInventory.Notes,
                createdAt: updatedBloodInventory.createdAt,
                updatedAt: updatedBloodInventory.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Delete a blood inventory entry
const deleteBloodInventory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedBloodInventory = await BloodInventory.findByIdAndDelete(id);

        if (!deletedBloodInventory) {
            return res.status(404).json({ message: 'Blood inventory entry not found', statusCode: 404 });
        }

        res.status(200).json({
            message: 'Blood inventory entry deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get blood inventory entry by ID
const getBloodInventoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const bloodInventory = await BloodInventory.findById(id);

        if (!bloodInventory) {
            return res.status(404).json({ message: 'Blood inventory entry not found', statusCode: 404 });
        }

        res.status(200).json({
            message: 'Blood inventory entry retrieved successfully',
            bloodInventory: {
                id: bloodInventory._id,
                bloodPacketId: bloodInventory.bloodPacketId,
                bloodType: bloodInventory.bloodType,
                units: bloodInventory.units,
                donerName: bloodInventory.donerName,
                donerphone: bloodInventory.donerphone,
                donerAge: bloodInventory.donerAge,
                donationDate: bloodInventory.donationDate,
                Notes: bloodInventory.Notes,
                createdAt: bloodInventory.createdAt,
                updatedAt: bloodInventory.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all blood inventory entries
const getAllBloodInventory = async (req, res) => {
    try {
        const bloodInventory = await BloodInventory.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Blood inventory entries retrieved successfully',
            bloodInventory: bloodInventory.map(entry => ({
                id: entry._id,
                bloodPacketId: entry.bloodPacketId,
                bloodType: entry.bloodType,
                units: entry.units,
                donerName: entry.donerName,
                donerphone: entry.donerphone,
                donerAge: entry.donerAge,
                donationDate: entry.donationDate,
                Notes: entry.Notes,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt
            })),
            count: bloodInventory.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Issue blood from inventory
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
        // Optionally, log the issue transaction (not persisted here)
        res.status(200).json({
            message: 'Blood issued successfully',
            bloodType,
            unitsIssued: unitsToIssue,
            remainingUnits: inventory.units,
            requestId,
            doctorName,
            patientName,
            reason,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Search blood inventory by bloodPacketId
const searchBloodByPacketId = async (req, res) => {
    try {
        const { bloodPacketId } = req.params;
        
        if (!bloodPacketId) {
            return res.status(400).json({ message: 'bloodPacketId is required', statusCode: 400 });
        }

        const bloodInventory = await BloodInventory.findOne({ 
            bloodPacketId: { $regex: new RegExp(bloodPacketId, 'i') } 
        });

        if (!bloodInventory) {
            return res.status(404).json({ 
                message: 'Blood packet not found with the provided ID', 
                statusCode: 404 
            });
        }

        res.status(200).json({
            message: 'Blood packet found successfully',
            bloodInventory: {
                id: bloodInventory._id,
                bloodPacketId: bloodInventory.bloodPacketId,
                bloodType: bloodInventory.bloodType,
                units: bloodInventory.units,
                donerName: bloodInventory.donerName,
                donerphone: bloodInventory.donerphone,
                donerAge: bloodInventory.donerAge,
                donationDate: bloodInventory.donationDate,
                Notes: bloodInventory.Notes,
                createdAt: bloodInventory.createdAt,
                updatedAt: bloodInventory.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get aggregated blood inventory (total units per blood type)
const getBloodStockSummary = async (req, res) => {
    try {
        const stockSummary = await BloodInventory.aggregate([
            {
                $group: {
                    _id: '$bloodType',
                    totalUnits: { $sum: '$units' },
                    totalPackets: { $count: {} },
                    latestDonation: { $max: '$donationDate' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            message: 'Blood stock summary retrieved successfully',
            stockSummary: stockSummary.map(stock => ({
                bloodType: stock._id,
                totalUnits: stock.totalUnits,
                totalPackets: stock.totalPackets,
                latestDonation: stock.latestDonation
            })),
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = { 
    createBloodInventory, 
    updateBloodInventory, 
    deleteBloodInventory, 
    getBloodInventoryById, 
    getAllBloodInventory, 
    issueBlood,
    searchBloodByPacketId,
    getBloodStockSummary };