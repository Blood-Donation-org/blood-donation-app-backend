const DoctorProfile = require('../schemas/DoctorProfileSchema');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Create doctor user and doctor profile in one operation
const createDoctorWithProfile = async (req, res) => {
    try {
        // User fields
        const {
            accountType = '',
            email,
            password,
            fullName,
            phoneNumber,
            dob,
            bloodType,
            address,
            medicalHistory = '',
            isDoner = false,
            isPatient = false,
        } = req.body;
        // Doctor profile fields
        const {
            hospitalAffiliation,
            specialization,
            medicalLicenseNumber,
            yearsOfExperience,
        } = req.body;

        if (!email || !password || !fullName || !phoneNumber || !dob || !bloodType || !address || !hospitalAffiliation || !specialization || !medicalLicenseNumber) {
            return res.status(400).json({ message: 'Required fields missing', statusCode: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered', statusCode: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with role 'doctor'
        const user = new User({
            accountType,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            role: 'doctor',
            fullName,
            phoneNumber,
            dob,
            bloodType,
            address,
            medicalHistory,
            isDoner,
            isPatient
        });
        await user.save();

        // Create doctor profile
        const doctorProfile = new DoctorProfile({
            userId: user._id,
            hospitalAffiliation,
            specialization,
            medicalLicenseNumber,
            yearsOfExperience,
        });
        await doctorProfile.save();

        res.status(201).json({
            message: 'Doctor user and profile created successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                dob: user.dob,
                bloodType: user.bloodType,
                address: user.address,
                medicalHistory: user.medicalHistory,
                isDoner: user.isDoner,
                isPatient: user.isPatient,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            doctorProfile: doctorProfile,
            statusCode: 201
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get doctor profile by userId
const getDoctorProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await DoctorProfile.findOne({ userId }).populate('userId');
        if (!profile) {
            return res.status(404).json({ message: 'Doctor profile not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'Doctor profile retrieved successfully',
            doctorProfile: profile,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get all doctor profiles
const getAllDoctorProfiles = async (req, res) => {
    try {
        const profiles = await DoctorProfile.find().populate('userId');
        res.status(200).json({
            message: 'All doctor profiles retrieved successfully',
            doctorProfiles: profiles,
            count: profiles.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Delete doctor profile and user
const deleteDoctor = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Try to delete doctor profile
        const deletedProfile = await DoctorProfile.findOneAndDelete({ userId: userId });

        // Try to delete user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedProfile && !deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'Neither user nor doctor profile found'
            });
        }

        if (!deletedProfile) {
            return res.status(200).json({
                success: true,
                message: 'User deleted, but doctor profile not found',
                deletedUser
            });
        }

        if (!deletedUser) {
            return res.status(200).json({
                success: true,
                message: 'Doctor profile deleted, but user not found',
                deletedProfile
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User and associated profile deleted successfully',
            deletedUser,
            deletedProfile
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

module.exports = { createDoctorWithProfile, getDoctorProfileByUserId, getAllDoctorProfiles, deleteDoctor };
