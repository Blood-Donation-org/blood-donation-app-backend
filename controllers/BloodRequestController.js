// Get all blood requests by user
const getAllBloodRequestsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required', statusCode: 400 });
        }
        const requests = await BloodRequest.find({ user: userId }).populate('user');
        res.status(200).json({
            message: 'Blood requests for user retrieved successfully',
            bloodRequests: requests.map(request => ({
                id: request._id,
                patientName: request.patientName,
                age: request.age,
                gender: request.gender,
                bloodType: request.bloodType,
                unitsRequired: request.unitsRequired,
                urgencyLevel: request.urgencyLevel,
                wardNumber: request.wardNumber,
                contactNumber: request.contactNumber,
                medicalCondition: request.medicalCondition,
                surgeryDate: request.surgeryDate,
                additionalNotes: request.additionalNotes,
                dtFormUpload: request.dtFormUpload,
                status: request.status,
                confirmationStatus: request.confirmationStatus,
                user: request.user,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            })),
            count: requests.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

const BloodRequest = require('../schemas/BloodRequestSchema');
const { validationResult } = require('express-validator');
const Notification = require('../schemas/NotificationSchema');

// Create a new blood request
const createBloodRequest = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }
        const {
            patientName,
            age,
            gender,
            bloodType,
            unitsRequired,
            urgencyLevel,
            wardNumber,
            contactNumber,
            medicalCondition,
            surgeryDate,
            additionalNotes,
            status = 'pending',
            confirmationStatus = 'unconfirmed',
            user
        } = req.body;
        let dtFormUpload = '';
        if (req.file) {
            // Save relative path for frontend access
            dtFormUpload = req.file.filename;
            console.log('File uploaded successfully:', {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            });
        } else {
            console.log('No file uploaded in request');
        }
        const bloodRequest = new BloodRequest({
            patientName,
            age,
            gender,
            bloodType,
            unitsRequired,
            urgencyLevel,
            wardNumber,
            contactNumber,
            medicalCondition,
            surgeryDate,
            additionalNotes,
            dtFormUpload,
            status,
            confirmationStatus,
            user
        });
        await bloodRequest.save();
        await bloodRequest.populate('user');
        // Create notification for new blood request
        const notification = new Notification({
            user: bloodRequest.user._id,
            type: 'blood-request',
            message: `New blood request created for patient ${bloodRequest.patientName}`,
            relatedRequest: bloodRequest._id,
            status: 'unread'
        });
        await notification.save();
        res.status(201).json({
            message: 'Blood request created successfully',
            bloodRequest: {
                id: bloodRequest._id,
                patientName: bloodRequest.patientName,
                age: bloodRequest.age,
                gender: bloodRequest.gender,
                bloodType: bloodRequest.bloodType,
                unitsRequired: bloodRequest.unitsRequired,
                urgencyLevel: bloodRequest.urgencyLevel,
                wardNumber: bloodRequest.wardNumber,
                contactNumber: bloodRequest.contactNumber,
                medicalCondition: bloodRequest.medicalCondition,
                surgeryDate: bloodRequest.surgeryDate,
                additionalNotes: bloodRequest.additionalNotes,
                dtFormUpload: bloodRequest.dtFormUpload,
                status: bloodRequest.status,
                confirmationStatus: bloodRequest.confirmationStatus,
                user: bloodRequest.user,
                createdAt: bloodRequest.createdAt,
                updatedAt: bloodRequest.updatedAt
            },
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all blood requests
const getAllBloodRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find().populate('user');
        const DoctorProfile = require('../schemas/DoctorProfileSchema');
        // Fetch doctor profiles for all users in requests
        const userIds = requests.map(r => r.user?._id).filter(Boolean);
        const doctorProfiles = await DoctorProfile.find({ userId: { $in: userIds } });
        // Map userId to doctorProfile
        const doctorProfileMap = {};
        doctorProfiles.forEach(profile => {
            doctorProfileMap[profile.userId.toString()] = profile;
        });

        res.status(200).json({
            message: 'All blood requests retrieved successfully',
            bloodRequests: requests.map(request => ({
                id: request._id,
                patientName: request.patientName,
                age: request.age,
                gender: request.gender,
                bloodType: request.bloodType,
                unitsRequired: request.unitsRequired,
                urgencyLevel: request.urgencyLevel,
                wardNumber: request.wardNumber,
                contactNumber: request.contactNumber,
                medicalCondition: request.medicalCondition,
                surgeryDate: request.surgeryDate,
                additionalNotes: request.additionalNotes,
                dtFormUpload: request.dtFormUpload,
                status: request.status,
                confirmationStatus: request.confirmationStatus,
                user: request.user,
                doctorProfile: request.user? doctorProfileMap[request.user._id.toString()] : null,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            })),
            count: requests.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get blood request by ID
const getBloodRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await BloodRequest.findById(id).populate('user');
        if (!request) {
            return res.status(404).json({ message: 'Blood request not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Blood request retrieved successfully',
            bloodRequest: {
                id: request._id,
                patientName: request.patientName,
                age: request.age,
                gender: request.gender,
                bloodType: request.bloodType,
                unitsRequired: request.unitsRequired,
                urgencyLevel: request.urgencyLevel,
                wardNumber: request.wardNumber,
                contactNumber: request.contactNumber,
                medicalCondition: request.medicalCondition,
                surgeryDate: request.surgeryDate,
                additionalNotes: request.additionalNotes,
                dtFormUpload: request.dtFormUpload,
                status: request.status,
                confirmationStatus: request.confirmationStatus,
                user: request.user,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Update blood request
const updateBloodRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = {};
        const allowedFields = [
            'patientName', 'age', 'gender', 'bloodType', 'unitsRequired', 'urgencyLevel',
            'wardNumber', 'contactNumber', 'medicalCondition', 'surgeryDate', 'additionalNotes',
            'dtFormUpload', 'status', 'confirmationStatus', 'user'
        ];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        }
        if (req.file) {
            updateFields.dtFormUpload = req.file.filename;
        }
        const updatedRequest = await BloodRequest.findByIdAndUpdate(id, updateFields, { new: true }).populate('user');
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Blood request not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Blood request updated successfully',
            bloodRequest: {
                id: updatedRequest._id,
                patientName: updatedRequest.patientName,
                age: updatedRequest.age,
                gender: updatedRequest.gender,
                bloodType: updatedRequest.bloodType,
                unitsRequired: updatedRequest.unitsRequired,
                urgencyLevel: updatedRequest.urgencyLevel,
                wardNumber: updatedRequest.wardNumber,
                contactNumber: updatedRequest.contactNumber,
                medicalCondition: updatedRequest.medicalCondition,
                surgeryDate: updatedRequest.surgeryDate,
                additionalNotes: updatedRequest.additionalNotes,
                dtFormUpload: updatedRequest.dtFormUpload,
                status: updatedRequest.status,
                confirmationStatus: updatedRequest.confirmationStatus,
                user: updatedRequest.user,
                createdAt: updatedRequest.createdAt,
                updatedAt: updatedRequest.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Delete blood request
const deleteBloodRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRequest = await BloodRequest.findByIdAndDelete(id);
        if (!deletedRequest) {
            return res.status(404).json({ message: 'Blood request not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Blood request deleted successfully',
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};


// Update status only
const updateBloodRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required', statusCode: 400 });
        }
        const updatedRequest = await BloodRequest.findByIdAndUpdate(id, { status }, { new: true }).populate('user');
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Blood request not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Status updated successfully',
            bloodRequest: {
                id: updatedRequest._id,
                status: updatedRequest.status,
                confirmationStatus: updatedRequest.confirmationStatus,
                user: updatedRequest.user,
                updatedAt: updatedRequest.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Update confirmationStatus only
const updateBloodRequestConfirmationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmationStatus } = req.body;
        if (!confirmationStatus) {
            return res.status(400).json({ message: 'Confirmation status is required', statusCode: 400 });
        }
        const updatedRequest = await BloodRequest.findByIdAndUpdate(id, { confirmationStatus }, { new: true }).populate('user');
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Blood request not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Confirmation status updated successfully',
            bloodRequest: {
                id: updatedRequest._id,
                status: updatedRequest.status,
                confirmationStatus: updatedRequest.confirmationStatus,
                user: updatedRequest.user,
                updatedAt: updatedRequest.updatedAt
            },
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Download dtForm file
const downloadDtForm = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await BloodRequest.findById(id);
        
        if (!request) {
            return res.status(404).json({ message: 'Blood request not found', statusCode: 404 });
        }
        
        if (!request.dtFormUpload) {
            return res.status(404).json({ message: 'No file uploaded for this request', statusCode: 404 });
        }
        
        const path = require('path');
        const fs = require('fs');
        const filePath = path.join(__dirname, '..', 'uploads', request.dtFormUpload);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server', statusCode: 404 });
        }
        
        // Get file stats for proper headers
        const stats = fs.statSync(filePath);
        const fileExtension = path.extname(request.dtFormUpload).toLowerCase();
        
        // Set appropriate content type based on file extension
        let contentType = 'application/octet-stream';
        switch (fileExtension) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.doc':
                contentType = 'application/msword';
                break;
            case '.docx':
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case '.txt':
                contentType = 'text/plain';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
        }
        
        // Set headers for file download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Disposition', `attachment; filename="${request.patientName}_dtForm${fileExtension}"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error downloading file', error: error.message, statusCode: 500 });
            }
        });
        
    } catch (error) {
        console.error('Error in downloadDtForm:', error);
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = {
    createBloodRequest,
    getAllBloodRequests,
    getBloodRequestById,
    updateBloodRequest,
    deleteBloodRequest,
    updateBloodRequestStatus,
    updateBloodRequestConfirmationStatus,
    getAllBloodRequestsByUser,
    downloadDtForm
};
