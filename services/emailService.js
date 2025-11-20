const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with Gmail configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use app password for Gmail
        }
    });
};

// Email templates
const emailTemplates = {
    registrationConfirmation: (userName, campName, campDate, campLocation, campTime) => ({
        subject: '🩸 Blood Camp Registration Confirmed - Thank You for Your Generosity!',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background-color: #f8f9fa; padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #CD2F2F; margin: 0; font-size: 28px;">🩸 LifeLink</h1>
                        <p style="color: #666; margin: 5px 0; font-size: 16px;">Blood Donation Platform</p>
                    </div>
                    
                    <div style="background-color: #e8f5e8; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <h2 style="color: #28a745; margin: 0 0 10px 0;">Registration Confirmed! ✅</h2>
                        <p style="color: #333; margin: 0;">Dear <strong>${userName}</strong>, thank you for registering for our blood donation camp.</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #CD2F2F; margin: 0 0 15px 0;">📅 Camp Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Camp Name:</td>
                                <td style="padding: 8px 0; color: #333;">${campName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Date:</td>
                                <td style="padding: 8px 0; color: #333;">${campDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Time:</td>
                                <td style="padding: 8px 0; color: #333;">${campTime}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Location:</td>
                                <td style="padding: 8px 0; color: #333;">${campLocation}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">📝 Important Reminders</h3>
                        <ul style="color: #856404; margin: 0; padding-left: 20px;">
                            <li>Please bring a valid ID and eat a proper meal before donation</li>
                            <li>Ensure you're well-hydrated and have had adequate rest</li>
                            <li>Arrive 15 minutes early for registration</li>
                            <li>You'll receive a reminder email one week before the camp</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #666; font-style: italic;">Thank you for your life-saving contribution! 💝</p>
                        <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
                            Best regards,<br>
                            The LifeLink Team
                        </p>
                    </div>
                </div>
            </div>
        `
    }),

    weekReminder: (userName, campName, campDate, campLocation, campTime) => ({
        subject: '⏰ Reminder: Blood Donation Camp in One Week - Your Life-Saving Appointment Awaits!',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background-color: #f8f9fa; padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #CD2F2F; margin: 0; font-size: 28px;">🩸 LifeLink</h1>
                        <p style="color: #666; margin: 5px 0; font-size: 16px;">Blood Donation Platform</p>
                    </div>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <h2 style="color: #856404; margin: 0 0 10px 0;">⏰ Upcoming Donation in One Week!</h2>
                        <p style="color: #333; margin: 0;">Dear <strong>${userName}</strong>, this is a friendly reminder about your upcoming blood donation appointment.</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #CD2F2F; margin: 0 0 15px 0;">📅 Camp Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Camp Name:</td>
                                <td style="padding: 8px 0; color: #333;">${campName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Date:</td>
                                <td style="padding: 8px 0; color: #333; font-weight: bold; color: #CD2F2F;">${campDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Time:</td>
                                <td style="padding: 8px 0; color: #333;">${campTime}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #555; font-weight: bold;">Location:</td>
                                <td style="padding: 8px 0; color: #333;">${campLocation}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #155724; margin: 0 0 10px 0;">🍎 Preparation Guidelines</h3>
                        <ul style="color: #155724; margin: 0; padding-left: 20px;">
                            <li>Get a good night's sleep (7-8 hours) before donation</li>
                            <li>Eat iron-rich foods and stay well-hydrated</li>
                            <li>Avoid alcohol and smoking 24 hours before donation</li>
                            <li>Bring a valid photo ID</li>
                            <li>Consider bringing a friend for support!</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #CD2F2F; font-weight: bold; font-size: 18px;">See you next week! Your donation can save up to 3 lives! 🙏</p>
                        <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
                            Best regards,<br>
                            The LifeLink Team
                        </p>
                    </div>
                </div>
            </div>
        `
    }),

    nextDonationReminder: (userName, nextDonationDate) => ({
        subject: '💝 Thank You for Donating! Your Next Donation Opportunity Awaits',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background-color: #f8f9fa; padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #CD2F2F; margin: 0; font-size: 28px;">🩸 LifeLink</h1>
                        <p style="color: #666; margin: 5px 0; font-size: 16px;">Blood Donation Platform</p>
                    </div>
                    
                    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <h2 style="color: #28a745; margin: 0 0 10px 0;">🌟 Thank You, Life Saver!</h2>
                        <p style="color: #333; margin: 0;">Dear <strong>${userName}</strong>, thank you for your generous blood donation yesterday. Your contribution is making a real difference in saving lives!</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f8f9fa; border-radius: 50px; padding: 30px; margin: 20px 0; border: 3px solid #CD2F2F;">
                            <h3 style="color: #CD2F2F; margin: 0; font-size: 24px;">🗓️ Mark Your Calendar!</h3>
                            <p style="color: #333; margin: 10px 0; font-size: 18px;">You can donate again on:</p>
                            <p style="color: #CD2F2F; font-weight: bold; font-size: 22px; margin: 0;">${nextDonationDate}</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #1565c0; margin: 0 0 10px 0;">📊 Your Impact</h3>
                        <p style="color: #1565c0; margin: 0;">Your single donation can:</p>
                        <ul style="color: #1565c0; margin: 10px 0; padding-left: 20px;">
                            <li><strong>Save up to 3 lives</strong> by helping patients during surgery, cancer treatment, and emergencies</li>
                            <li><strong>Help accident victims</strong> who need immediate blood transfusions</li>
                            <li><strong>Support chronic patients</strong> who rely on regular blood supplies</li>
                        </ul>
                    </div>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">💡 Health Benefits for You</h3>
                        <ul style="color: #856404; margin: 0; padding-left: 20px;">
                            <li>Helps maintain healthy iron levels</li>
                            <li>Provides a free mini health screening</li>
                            <li>May reduce risk of heart disease</li>
                            <li>Gives you the satisfaction of helping others</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #CD2F2F; font-weight: bold; font-size: 16px;">We'll send you a reminder closer to your next eligible donation date!</p>
                        <p style="color: #666; font-style: italic; margin: 20px 0;">Thank you for being a hero! 🦸‍♀️🦸‍♂️</p>
                        <p style="color: #999; font-size: 14px; margin: 20px 0 0 0;">
                            Best regards,<br>
                            The LifeLink Team
                        </p>
                    </div>
                </div>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (to, template) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"LifeLink Blood Donation" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
            to: to,
            subject: template.subject,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Specific email sending functions
const sendRegistrationConfirmation = async (userEmail, userName, campDetails) => {
    const template = emailTemplates.registrationConfirmation(
        userName,
        campDetails.campName,
        campDetails.date,
        campDetails.place,
        campDetails.time
    );
    return await sendEmail(userEmail, template);
};

const sendWeekReminder = async (userEmail, userName, campDetails) => {
    const template = emailTemplates.weekReminder(
        userName,
        campDetails.campName,
        campDetails.date,
        campDetails.place,
        campDetails.time
    );
    return await sendEmail(userEmail, template);
};

const sendNextDonationReminder = async (userEmail, userName, nextDonationDate) => {
    const template = emailTemplates.nextDonationReminder(
        userName,
        nextDonationDate
    );
    return await sendEmail(userEmail, template);
};

module.exports = {
    sendRegistrationConfirmation,
    sendWeekReminder,
    sendNextDonationReminder,
    sendEmail
};