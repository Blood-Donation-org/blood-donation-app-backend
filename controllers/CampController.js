const Camp = require('../schemas/CampSchema');
const { validationResult } = require('express-validator');
// Create a new camp
const createCamp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }

        const {
            campName,
            place,
            date,
            time,
            contactNumber,
            emailAddress,
            organizer,
            message = ''
        } = req.body;

        const camp = new Camp({
            campName,
            place,
            date,
            time,
            contactNumber,
            emailAddress,
            organizer,
            message
        });

        await camp.save();

        res.status(201).json({
            message: 'Camp created successfully',
            camp: {
                id: camp._id,
                campName: camp.campName,
                place: camp.place,
                date: camp.date,
                time: camp.time,
                contactNumber: camp.contactNumber,
                emailAddress: camp.emailAddress,
                organizer: camp.organizer,
                message: camp.message,
                createdAt: camp.createdAt,
                updatedAt: camp.updatedAt
            },
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Update a camp
const updateCamp = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = {};
        const allowedFields = [
            'campName', 'place', 'date', 'time', 'contactNumber', 'emailAddress', 'organizer', 'message'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        }

        const updatedCamp = await Camp.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedCamp) {
            return res.status(404).json({ message: 'Camp not found', statusCode: 404 });
        }

        res.status(200).json({
            message: 'Camp updated successfully',
            camp: {
                id: updatedCamp._id,
                campName: updatedCamp.campName,
                place: updatedCamp.place,
                date: updatedCamp.date,
                time: updatedCamp.time,
                contactNumber: updatedCamp.contactNumber,
                emailAddress: updatedCamp.emailAddress,
                organizer: updatedCamp.organizer,
                message: updatedCamp.message,
                createdAt: updatedCamp.createdAt,
                updatedAt: updatedCamp.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Delete a camp
const deleteCamp = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedCamp = await Camp.findByIdAndDelete(id);

        if (!deletedCamp) {
            return res.status(404).json({ message: 'Camp not found', statusCode: 404 });
        }

        res.status(200).json({
            message: 'Camp deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get camp by ID
const getCampById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const camp = await Camp.findById(id);

        if (!camp) {
            return res.status(404).json({ message: 'Camp not found', statusCode: 404 });
        }

        res.status(200).json({
            message: 'Camp retrieved successfully',
            camp: {
                id: camp._id,
                campName: camp.campName,
                place: camp.place,
                date: camp.date,
                time: camp.time,
                contactNumber: camp.contactNumber,
                emailAddress: camp.emailAddress,
                organizer: camp.organizer,
                message: camp.message,
                createdAt: camp.createdAt,
                updatedAt: camp.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all camps
const getAllCamps = async (req, res) => {
    try {
        const camps = await Camp.find();

        res.status(200).json({
            message: 'Camps retrieved successfully',
            camps: camps.map(camp => ({
                id: camp._id,
                campName: camp.campName,
                place: camp.place,
                date: camp.date,
                time: camp.time,
                contactNumber: camp.contactNumber,
                emailAddress: camp.emailAddress,
                organizer: camp.organizer,
                message: camp.message,
                createdAt: camp.createdAt,
                updatedAt: camp.updatedAt
            })),
            count: camps.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = { createCamp, updateCamp, deleteCamp, getCampById, getAllCamps };