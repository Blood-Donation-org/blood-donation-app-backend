# Blood Donation Email Notification System

This system automatically sends email notifications to users who register for blood donation camps.

## Email Types

### 1. Registration Confirmation Email
- **Triggered**: Immediately when a user registers for a camp
- **Content**: Welcome message with camp details and preparation instructions
- **Features**: Beautiful HTML template with camp information

### 2. Week Reminder Email  
- **Triggered**: 7 days before the camp date
- **Content**: Friendly reminder with camp details and preparation guidelines
- **Schedule**: Sent daily at 9:00 AM via cron job

### 3. Next Donation Reminder Email
- **Triggered**: 1 day after the camp date
- **Content**: Thank you message with next eligible donation date (4 months later)
- **Schedule**: Sent daily at 9:00 AM via cron job

## Setup Instructions

### 1. Install Dependencies
```bash
npm install node-cron nodemailer
```

### 2. Configure Environment Variables
Create a `.env` file with the following:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Gmail App Password Setup
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an "App Password":
   - Go to Security → App passwords
   - Select "Mail" and generate password
   - Use the 16-character password as `EMAIL_PASSWORD`

### 4. Start the Server
The email scheduler will automatically initialize when the server starts.

## API Endpoints

### Test Email Functionality

#### Send Week Reminders (Manual)
```
POST /api/v1/email-test/send-week-reminders
```

#### Send Next Donation Reminders (Manual)
```
POST /api/v1/email-test/send-next-donation-reminders
```

## Files Structure

```
services/
├── emailService.js          # Email templates and sending logic
├── emailScheduler.js        # Cron jobs and scheduling logic
└── ...

routes/
├── EmailTestRoute.js        # Test endpoints for manual email sending
└── ...

controllers/
├── CampRegistrationController.js  # Updated with email sending
└── ...
```

## Email Templates

All emails use responsive HTML templates with:
- LifeLink branding
- Beautiful styling with CSS inline
- Mobile-friendly design
- Clear call-to-actions
- Professional appearance

## Scheduling Details

- **Cron Schedule**: `0 9 * * *` (Daily at 9:00 AM)
- **Week Reminders**: Checks for camps happening in exactly 7 days
- **Next Donation**: Checks for camps that happened yesterday
- **Error Handling**: Graceful failure handling with console logging

## Troubleshooting

### Common Issues:

1. **Email not sending**
   - Check EMAIL_USER and EMAIL_PASSWORD in .env
   - Verify Gmail app password is correct
   - Check console logs for detailed error messages

2. **Cron job not running**
   - Verify server timezone
   - Check console logs for "Email reminder scheduler initialized"

3. **Wrong dates in emails**
   - Verify camp dates are stored correctly in database
   - Check date formatting in email templates

## Testing

1. **Manual Testing**: Use the test endpoints to send emails immediately
2. **Cron Testing**: Temporarily change cron schedule to `* * * * *` for every minute
3. **Email Content**: Check spam folder and email rendering

## Security Notes

- Never commit `.env` file to version control
- Use app passwords, not regular Gmail passwords
- Limit email sending rate to avoid being marked as spam
- Consider using email service providers (SendGrid, Mailgun) for production

## Future Enhancements

- Email templates customization via admin panel
- Email delivery status tracking
- Unsubscribe functionality
- Multiple email providers support
- Email analytics and reporting