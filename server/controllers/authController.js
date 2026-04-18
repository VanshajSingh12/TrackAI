import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc Signup user
 * @route POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'User already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (unverified)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires
    });

    // Send OTP via email
    try {
      const message = `Your TrackAI verification code is: ${otp}. It will expire in 10 minutes.`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4CAF50;">TrackAI Verification</h2>
          <p>Welcome to TrackAI! Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code will expire in 10 minutes.</p>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: 'Verify your TrackAI Account',
        message,
        html
      });

      res.status(201).json({
        status: 'success',
        message: 'User signed up. Please verify OTP sent to your email.'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // In a real scenario, you might want to handle this differently (e.g., allow resending OTP)
      res.status(201).json({
        status: 'success',
        message: 'User signed up, but email delivery failed. Please check server logs for OTP.'
      });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc Verify OTP
 * @route POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      status: 'success',
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email },
      message: 'Account verified successfully.'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        return res.status(401).json({ status: 'error', message: 'Account not verified.' });
      }

      res.json({
        status: 'success',
        token: generateToken(user._id),
        user: { id: user._id, username: user.username, email: user.email }
      });
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
