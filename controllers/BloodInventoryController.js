const BloodInventory = require('../schemas/BloodInventorySchema');
const { validationResult } = require('express-validator');

// Create a new blood inventory entry
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

        res.status(201).json({
            message: 'Blood inventory entry created successfully',
            bloodInventory: {
                id: bloodInventory._id,
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
        const bloodInventory = await BloodInventory.find();

        res.status(200).json({
            message: 'Blood inventory entries retrieved successfully',
            bloodInventory: bloodInventory.map(entry => ({
                id: entry._id,
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

module.exports = { createBloodInventory, updateBloodInventory, deleteBloodInventory, getBloodInventoryById, getAllBloodInventory, issueBlood };