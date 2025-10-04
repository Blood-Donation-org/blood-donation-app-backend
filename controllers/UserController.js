const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/UserSchema');
const { validationResult } = require('express-validator');

const initializeAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return { success: false, message: 'Admin already exists', statusCode: 409 };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const admin = new User({
            accountType: '',
            email: 'admin@example.com',
            password: hashedPassword,
            confirmPassword: hashedPassword,
            role: 'admin',
            fullName: 'System Administrator',
            phoneNumber: '0000000000',
            dob: '1970-01-01',
            bloodType: 'O+',
            address: 'N/A',
            medicalHistory: '',
            isDoner: true,
            isPatient: true,
        });

        await admin.save();
    return { success: true, message: 'admin created successfully', statusCode: 201 };
    } catch (error) {
    return { success: false, message: 'Failed to initialize admin', error: error.message, statusCode: 500 };
    }
};

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }

        const {
            accountType = '',
            email,
            password,
            role = 'user',
            fullName,
            phoneNumber,
            dob,
            bloodType,
            address,
            medicalHistory = '',
            isDoner = false,
            isPatient = false,
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered', statusCode: 400 });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set', statusCode: 500 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            accountType,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
            role,
            fullName,
            phoneNumber,
            dob,
            bloodType,
            address,
            medicalHistory,
            isDoner,
            isPatient,
        });

        await user.save();

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                isDoner: user.isDoner,
                isPatient: user.isPatient,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
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
                updatedAt: user.updatedAt,
            },
            statusCode: 201,
        });
    } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), statusCode: 400 });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials', statusCode: 400 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', statusCode: 400 });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set', statusCode: 500 });
        }

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                isDoner: user.isDoner,
                isPatient: user.isPatient,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
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
                updatedAt: user.updatedAt,
            },
            statusCode: 200,
        });
    } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = {};
        const allowedFields = [
            'accountType', 'email', 'password', 'confirmPassword', 'role', 'fullName',
            'phoneNumber', 'dob', 'bloodType', 'address', 'medicalHistory', 'isDoner', 'isPatient'
        ];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        }
        // If password is being updated, hash it
        if (updateFields.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(updateFields.password, salt);
            updateFields.password = hashedPassword;
            updateFields.confirmPassword = hashedPassword;
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role,
                fullName: updatedUser.fullName,
                phoneNumber: updatedUser.phoneNumber,
                dob: updatedUser.dob,
                bloodType: updatedUser.bloodType,
                address: updatedUser.address,
                medicalHistory: updatedUser.medicalHistory,
                isDoner: updatedUser.isDoner,
                isPatient: updatedUser.isPatient,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            },
            statusCode: 200,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

module.exports = { register, login, initializeAdmin, updateUser };
