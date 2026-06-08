const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;

  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: userData,
  });
};

module.exports = { generateToken, sendTokenResponse };
