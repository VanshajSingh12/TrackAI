import nodemailer from 'nodemailer';

/**
 * @desc Utility to send emails using Gmail
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // Use App Password, not regular password
    },
  });

  const mailOptions = {
    from: `"TrackAI Support" <${process.env.GMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
