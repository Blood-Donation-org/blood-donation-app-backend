# Email Testing Suite for Blood Donation App

This comprehensive testing suite provides multiple ways to test all email functionalities in your Blood Donation App. The app includes three types of automated emails:

1. **Registration Confirmation** - Sent when users register for blood donation camps
2. **Week Reminder** - Sent 7 days before a camp to registered users
3. **Next Donation Reminder** - Sent the day after a camp to inform users when they can donate again

## 📧 Email Types Tested

### 1. Registration Confirmation Email
- Sent immediately when a user registers for a camp
- Contains camp details, preparation guidelines, and thank you message
- Triggered by: `CampRegistrationController.js`

### 2. Week Reminder Email
- Sent 7 days before a camp starts
- Reminds users about their upcoming donation appointment
- Triggered by: Email scheduler (daily at 9:00 AM)

### 3. Next Donation Reminder Email
- Sent the day after a camp to participants
- Informs when they can donate again (4 months later)
- Triggered by: Email scheduler (daily at 9:00 AM)

## 🛠️ Testing Methods

### Method 1: Command Line Script (Recommended for Development)

**File:** `test/email-test-script.js`

```bash
# Test all email types
node test/email-test-script.js

# Test specific email type
node test/email-test-script.js registration
node test/email-test-script.js week-reminder
node test/email-test-script.js next-donation
node test/email-test-script.js custom

# Test configuration only
node test/email-test-script.js config

# Show help
node test/email-test-script.js help
```

**Features:**
- ✅ Comprehensive testing of all email types
- ✅ Colorful console output with detailed results
- ✅ Configuration validation
- ✅ Individual or batch testing
- ✅ Detailed error reporting

### Method 2: API Testing with Postman

**File:** `test/Email-Testing-Collection.postman_collection.json`

**Setup:**
1. Import the collection into Postman
2. Update collection variables:
   - `baseUrl`: Your server URL (default: http://localhost:5000)
   - `testEmail`: Your test email address
   - `testUserName`: Test user name

**Available Endpoints:**
- `GET /api/v1/email-test/test-email-config` - Check email configuration
- `GET /api/v1/email-test/available-camps` - Get camps for testing
- `POST /api/v1/email-test/test-registration-confirmation` - Test registration email
- `POST /api/v1/email-test/test-week-reminder` - Test week reminder email
- `POST /api/v1/email-test/test-next-donation-reminder` - Test next donation email
- `POST /api/v1/email-test/test-custom-email` - Test custom email
- `POST /api/v1/email-test/test-all-emails` - Test all email types
- `POST /api/v1/email-test/send-week-reminders` - Trigger scheduled week reminders
- `POST /api/v1/email-test/send-next-donation-reminders` - Trigger scheduled next donation reminders

### Method 3: Web Interface (User-Friendly)

**File:** `test/email-test-interface.html`

**Setup:**
1. Ensure your backend server is running
2. Open `email-test-interface.html` in a web browser
3. Enter your test email address
4. Select a camp from the dropdown
5. Use the various test buttons

**Features:**
- ✅ User-friendly web interface
- ✅ Real-time configuration checking
- ✅ Camp selection dropdown
- ✅ Individual and comprehensive testing
- ✅ Visual result display with color coding
- ✅ No technical knowledge required

## ⚙️ Prerequisites

### 1. Email Configuration
Create a `.env` file in your backend root directory with:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Important for Gmail users:**
- Use an **App Password**, not your regular Gmail password
- Enable 2-factor authentication on your Gmail account
- Generate an App Password: Gmail → Security → 2-Step Verification → App Passwords

### 2. Dependencies
Ensure these packages are installed:

```json
{
  "nodemailer": "^6.9.0",
  "node-cron": "^3.0.0",
  "dotenv": "^16.0.0"
}
```

Install with: `npm install nodemailer node-cron dotenv`

## 🚀 Quick Start Guide

### Step 1: Configure Email Settings
```bash
# In your backend .env file
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 2: Start Your Server
```bash
cd blood-donation-app-backend
npm start
# or
nodemon index.js
```

### Step 3: Run Quick Test
```bash
# Update the test email in the script first
# Edit test/email-test-script.js and change TEST_CONFIG.testEmail
node test/email-test-script.js
```

### Step 4: Check Results
- Check your email inbox for test emails
- Review console output for detailed results
- Fix any configuration issues reported

## 🔍 Troubleshooting Guide

### Common Issues

#### 1. "Email configuration issues"
**Solution:**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env` file
- For Gmail, use App Password (not regular password)
- Restart your server after updating `.env`

#### 2. "Authentication failed"
**Solution:**
- Enable 2-factor authentication on Gmail
- Generate a new App Password
- Use the 16-character App Password (remove spaces)

#### 3. "Network error" or "Connection timeout"
**Solution:**
- Check internet connection
- Verify firewall settings
- Try a different email provider if Gmail fails

#### 4. "No camps available for testing"
**Solution:**
- Create a camp using the API or frontend
- Use the "Create Test Camp" request in Postman
- Check database connection

#### 5. "Rate limiting" or "Too many requests"
**Solution:**
- Wait a few minutes between tests
- Gmail has sending limits for new accounts
- Use delays between test emails

### Testing Best Practices

1. **Start Small:** Test email configuration first
2. **Use Real Email:** Use your actual email address for testing
3. **Check Spam:** Email might go to spam folder initially
4. **Test Gradually:** Don't send all test emails at once
5. **Monitor Logs:** Watch console output for detailed error messages

## 📋 Test Checklist

Use this checklist to ensure all email functionality works:

### Configuration Tests
- [ ] Email configuration check passes
- [ ] Can connect to email server
- [ ] Environment variables are set correctly

### Individual Email Tests
- [ ] Registration confirmation email works
- [ ] Week reminder email works
- [ ] Next donation reminder email works
- [ ] Custom email functionality works

### Integration Tests
- [ ] Camp registration triggers confirmation email
- [ ] Scheduled reminders work (week reminder)
- [ ] Scheduled reminders work (next donation)
- [ ] All emails have correct content and formatting

### Production Readiness
- [ ] All tests pass consistently
- [ ] Emails don't go to spam
- [ ] Email templates look good on mobile devices
- [ ] Error handling works properly
- [ ] Logging is appropriate for production

## 📁 File Structure

```
blood-donation-app-backend/
├── test/
│   ├── email-test-script.js                    # Command line testing script
│   ├── Email-Testing-Collection.postman_collection.json  # Postman collection
│   ├── email-test-interface.html               # Web testing interface
│   └── EMAIL-TESTING-README.md                 # This file
├── services/
│   ├── emailService.js                         # Core email service
│   └── emailScheduler.js                       # Automated email scheduling
├── routes/
│   └── EmailTestRoute.js                       # API endpoints for testing
└── controllers/
    └── CampRegistrationController.js            # Handles registration emails
```

## 🚨 Security Notes

- **Never commit** `.env` files to version control
- Use **App Passwords** for email authentication
- Test with **your own email** addresses only
- **Limit** test email frequency to avoid rate limiting
- **Monitor** email logs for suspicious activity

## 🎯 Success Indicators

Your email system is working correctly when:

1. ✅ Configuration check returns "fully configured"
2. ✅ All test emails are received in your inbox
3. ✅ Email content displays correctly (HTML formatting)
4. ✅ No authentication or network errors in logs
5. ✅ Scheduled emails trigger automatically
6. ✅ Camp registration sends immediate confirmation

## 📞 Support

If you encounter issues:

1. Check the troubleshooting guide above
2. Review server logs for detailed error messages
3. Test with the simplest method first (configuration check)
4. Verify your Gmail App Password is correct
5. Try testing with a different email address

Remember: Email testing requires a working internet connection and properly configured email credentials.