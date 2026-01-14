// Placeholder for a real email service
// In a real app, use SendGrid, Mailgun, or Gmail SMTP
// Since I don't have user's SMTP credentials, I will mock this or use a test account if possible.
// For development, I will just LOG the OTP to the console.

const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    // 1. Log for debugging
    console.log(`[EmailService] Sending to: ${to}`);
    
    // 2. Transporter Configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 3. Send Mail
    try {
        await transporter.sendMail({
            from: '"Healio App" <no-reply@healio.com>',
            to,
            subject,
            text,
            html
        });
        console.log(`[EmailService] Email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        throw error; // Re-throw so controller catches it
    }
};

// Generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
    sendEmail,
    generateOTP
};
