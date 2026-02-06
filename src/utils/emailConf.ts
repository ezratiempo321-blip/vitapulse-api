import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Initialize the OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

/**
 * Core function to send the email via Gmail API
 */
// const sendGmail = async (to: string, subject: string, htmlContent: string) => {
//   try {
//     // Gmail API requires a specific RFC 2822 formatted string encoded in base  64url
//     const subjectEncoded = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
//     const messageParts = [
//       `To: ${to}`,
//       'Content-Type: text/html; charset=utf-8',
//       'MIME-Version: 1.0',
//       `Subject: ${subjectEncoded}`,
//       '',
//       htmlContent,
//     ];
//     const message = messageParts.join('\n');
    
//     const encodedMessage = Buffer.from(message)
//       .toString('base64')
//       .replace(/\+/g, '-')
//       .replace(/\//g, '_')
//       .replace(/=+$/, '');

//     const res = await gmail.users.messages.send({
//       userId: 'me',
//       requestBody: { raw: encodedMessage },
//     });

//     console.log(htmlContent);

//     console.log("Email sent successfully. ID:", res.data.id);
//     return true;
//   } catch (error) {
//     console.error("Gmail API Send Error:", error);
//     return false;
//   }
// };
const sendGmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Nodemailer Send Error:', error);
    return false;
  }
};

export const sendVerificationCode = async (email: string, code: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Welcome to Vitapulse!</h2>
        <p>Please verify your email address to get started:</p>
        <p>
            <a href="${process.env.APP_DOMAIN_NAME}/verification/${code}"
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
            </a>
        </p>
    </div>
  `;
  return await sendGmail(email, "Verify Your Email Address", html);
};

export const sendAlertEmail = async (email: string, alertMessage: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #D32F2F;">⚠️ Important Alert from Vitapulse</h2>
        <p>${alertMessage}</p>
        <p>If you did not initiate this, contact support.</p>
    </div>
  `;
  return await sendGmail(email, "⚠️ Important Alert from Vitapulse", html);
};

export const sendResetPassword = async (email: string, token: string) => {
  const html = `
    <p>You requested a password reset.</p>
    <p>Click <a href="${process.env.APP_DOMAIN_NAME}/reset-password/${token}">here</a> to reset your password.</p>
  `;
  return await sendGmail(email, "Password Reset", html);
};