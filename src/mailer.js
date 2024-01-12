// mailer.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chandrakeshram31@gmail.com', 
    pass: 'password', 
  },
});

module.exports = {
  sendMail: async (to, subject, text) => {
    const mailOptions = {
      from: 'chandrakeshram31@gmail.com', // Sender's email address
      to,
      subject,
      text,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  },
};
