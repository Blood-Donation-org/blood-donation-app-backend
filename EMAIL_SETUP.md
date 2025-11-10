# Email Setup for Forgot Password Functionality

This document explains how to set up Gmail SMTP for the forgot password feature.

## Prerequisites

You need a Gmail account to send emails. It's recommended to use a dedicated email account for your application rather than your personal Gmail.

## Steps to Configure Gmail SMTP

### 1. Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification"
3. Follow the steps to enable 2FA if not already enabled

### 2. Generate an App Password

1. Go to Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "App passwords"
3. Select "Mail" as the app and choose your device
4. Google will generate a 16-character password
5. **Important**: Save this password securely - you won't be able to see it again

### 3. Configure Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```bash
# Copy from .env.example and add these email settings
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
```

**Important Notes:**
- Use the Gmail address as `EMAIL_USER`
- Use the 16-character app password (not your regular Gmail password) as `EMAIL_PASS`
- Set `FRONTEND_URL` to match your frontend application URL

### 4. Security Best Practices

- Never commit your `.env` file to version control
- Use a dedicated Gmail account for your application
- Regularly rotate your app passwords
- Monitor email sending logs for any suspicious activity

## Testing the Setup

Once configured, you can test the forgot password functionality by:

1. Starting your backend server
2. Using the frontend forgot password form
3. Checking if emails are received successfully

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Make sure you're using the app password, not your regular Gmail password
2. **Less Secure App Access**: This is no longer needed with app passwords
3. **Email Not Received**: Check spam/junk folders
4. **Rate Limiting**: Gmail has sending limits for apps

### Error Messages:

- `Invalid credentials`: Check your email and app password
- `Authentication failed`: Ensure 2FA is enabled and you're using an app password
- `Service unavailable`: Check your internet connection and Gmail service status

## Email Templates

The system sends HTML-formatted emails with:
- Professional styling matching the LifeLink brand
- Clear instructions for password reset
- Security warnings about link expiration
- Branded headers and footers

## Rate Limits

Gmail has the following approximate limits:
- 500 emails per day for free accounts
- 2000 emails per day for Google Workspace accounts
- Rate limit of 10-15 emails per minute

For production applications, consider using dedicated email services like SendGrid, AWS SES, or Mailgun for higher reliability and better deliverability.