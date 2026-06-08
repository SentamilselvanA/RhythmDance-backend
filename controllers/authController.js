const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/token');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password)
      return res.status(400).json({ success: false, message: 'All fields (name, email, mobile, password) are required' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, mobile, password });

    const verifyToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user, verifyToken);
    } catch (emailErr) {
      console.error('[Register] Email send failed (non-fatal):', emailErr.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('[Register] Error:', err.message, '\n', err.stack);
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[Login] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('[VerifyEmail] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    const token = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user, token);
      res.json({ success: true, message: 'Password reset email sent' });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('[ForgotPassword] Email failed:', emailErr.message);
      res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error('[ForgotPassword] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[ResetPassword] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[UpdatePassword] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
