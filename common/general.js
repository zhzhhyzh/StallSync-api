require('dotenv').config();
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const senderEmail = 'yeohzh-wp22@student.tarc.edu.my';
const senderName = 'StallSync';

async function sendEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  attachmentName,
  attachmentBase64,
}) {
  const url = 'https://api.brevo.com/v3/smtp/email';

  const headers = {
    'api-key': BREVO_API_KEY,
    'Content-Type': 'application/json',
  };

  const body = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: toEmail, name: toName }],
    subject: subject,
    htmlContent: htmlContent,
  };

  if (attachmentName && attachmentBase64) {
    body.attachment = [
      {
        content: attachmentBase64,
        name: attachmentName,
      },
    ];
  }

  try {
    const response = await axios.post(url, body, { headers });
    if (![201, 202].includes(response.status)) {
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error.message);
  }
}

// Example usage:
// sendEmail({
//   toEmail: 'recipient@example.com',
//   toName: 'Recipient',
//   subject: 'Test Subject',
//   htmlContent: '<h1>Hello</h1><p>This is a test.</p>',
//   attachmentName: 'test.txt',
//   attachmentBase64: Buffer.from('Hello World').toString('base64'),
// });

module.exports = { sendEmail };
