const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"ODOP Marketplace" <${process.env.SMTP_USER}>`,
      to, subject, html, text,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email failed:', error.message);
    return null;
  }
};

const sendWelcomeEmail = (to, name) => sendEmail({
  to, subject: 'Welcome to ODOP Marketplace!',
  html: `<h2>Welcome ${name}!</h2><p>Discover authentic Indian handicrafts from artisans across India.</p>`,
});

const sendOrderConfirmation = (to, name, orderNumber, total) => sendEmail({
  to, subject: `Order Confirmed - ${orderNumber}`,
  html: `<h2>Order Confirmed!</h2><p>Hi ${name}, your order <strong>${orderNumber}</strong> (₹${total}) has been placed.</p>`,
});

const sendOrderStatusUpdate = (to, name, orderNumber, status) => sendEmail({
  to, subject: `Order Update - ${orderNumber}`,
  html: `<h2>Order Update</h2><p>Hi ${name}, order <strong>${orderNumber}</strong> status: <strong>${status}</strong></p>`,
});

module.exports = { sendEmail, sendWelcomeEmail, sendOrderConfirmation, sendOrderStatusUpdate };
