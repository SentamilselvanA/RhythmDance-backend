const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
  process.env.EMAIL_HOST && process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes('your_');

const sendEmail = async ({ to, subject, html }) => {
  if (!isEmailConfigured()) {
    console.log(`[Email skipped - not configured] To: ${to} | Subject: ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

exports.sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Rhythm Dance Academy!',
    html: `<h2>Welcome, ${user.name}!</h2><p>Your account has been created successfully. Start your dance journey with us!</p>`,
  });

exports.sendVerificationEmail = (user, token) =>
  sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Rhythm Dance Academy',
    html: `<h2>Hello ${user.name},</h2><p>Click the link below to verify your email:</p><a href="${process.env.CLIENT_URL}/verify-email/${token}">Verify Email</a><p>This link expires in 24 hours.</p>`,
  });

exports.sendPasswordResetEmail = (user, token) =>
  sendEmail({
    to: user.email,
    subject: 'Password Reset - Rhythm Dance Academy',
    html: `<h2>Hello ${user.name},</h2><p>Click the link below to reset your password:</p><a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset Password</a><p>This link expires in 10 minutes.</p>`,
  });

exports.sendApplicationStatusEmail = (application, status) =>
  sendEmail({
    to: application.email,
    subject: `Application ${status} - Rhythm Dance Academy`,
    html: `<h2>Hello ${application.fullName},</h2><p>Your application for <strong>${application.selectedCourse}</strong> has been <strong>${status}</strong>.</p><p>Thank you for your interest in Rhythm Dance Academy!</p>`,
  });

exports.sendEnquiryReplyEmail = (enquiry, reply) =>
  sendEmail({
    to: enquiry.email,
    subject: 'Reply to Your Enquiry - Rhythm Dance Academy',
    html: `<h2>Hello ${enquiry.name},</h2><p>Thank you for your enquiry. Here is our response:</p><p>${reply}</p>`,
  });
