const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../schemas/UserSchema');
const { validationResult } = require('express-validator');

// Email configuration
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

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

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            message: 'All users retrieved successfully',
            users: users.map(user => ({
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
            })),
            count: users.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get users by role
const getByUserRole = async (req, res) => {
    try {
        const { role } = req.params;
        if (!role) {
            return res.status(400).json({ message: 'role is required', statusCode: 400 });
        }
        const users = await User.find({ role });
        res.status(200).json({
            message: 'Users by role retrieved successfully',
            users: users.map(user => ({
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
            })),
            count: users.length,
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', statusCode: 404 });
        }
        res.status(200).json({
            message: 'User retrieved successfully',
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
            statusCode: 200
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

const changePassword = async (req, res) => {
    try {
        const { id } = req.params; // logged-in user's id
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required', statusCode: 400 });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters', statusCode: 400 });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match', statusCode: 400 });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from current password', statusCode: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', statusCode: 404 });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect', statusCode: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully', statusCode: 200 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, statusCode: 500 });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required', statusCode: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist', statusCode: 404 });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiration (1 hour from now)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Email options
        const mailOptions = {
            from: `"LifeLink Blood Donation" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request - LifeLink',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #CD2F2F; margin-bottom: 10px;">LifeLink</h1>
                            <h2 style="color: #333; margin: 0;">Password Reset Request</h2>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${user.fullName || 'User'}</strong>,
                            </p>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password for your LifeLink account. 
                                If you didn't make this request, you can safely ignore this email.
                            </p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; background-color: #CD2F2F; color: white; 
                                      text-decoration: none; padding: 15px 30px; border-radius: 5px; 
                                      font-size: 16px; font-weight: bold;">
                                Reset Your Password
                            </a>
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #888; font-size: 14px; line-height: 1.5;">
                                <strong>Important:</strong> This link will expire in 1 hour for security purposes.
                                If you don't reset your password within this time, you'll need to request a new reset link.
                            </p>
                            <p style="color: #888; font-size: 14px; line-height: 1.5;">
                                If the button above doesn't work, you can copy and paste this link into your browser:
                                <br><a href="${resetUrl}" style="color: #CD2F2F;">${resetUrl}</a>
                            </p>
                        </div>

                        <div style="margin-top: 30px; text-align: center;">
                            <p style="color: #888; font-size: 12px;">
                                This is an automated message from LifeLink Blood Donation System.
                                <br>Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Send email
        const transporter = createEmailTransporter();
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Password reset link has been sent to your email',
            statusCode: 200
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send reset email. Please try again.', statusCode: 500 });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required', statusCode: 400 });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long', statusCode: 400 });
        }

        // Hash the token to compare with stored hash
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with matching token and check if token hasn't expired
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid or has expired', 
                statusCode: 400 
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear reset token fields
        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password has been reset successfully',
            statusCode: 200
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.', statusCode: 500 });
    }
};

module.exports = { 
    register, 
    login, 
    initializeAdmin, 
    updateUser, 
    getAllUsers, 
    getByUserRole, 
    getUserById, 
    changePassword, 
    forgotPassword, 
    resetPassword 
};
