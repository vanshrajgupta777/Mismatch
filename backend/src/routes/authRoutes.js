import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'mismatch_super_secret_jwt_key_987654321',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (girl or boy)
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, gender, interests, bio, avatar, likesCarryOver } = req.body;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and gender (girl or boy)',
      });
    }

    if (!['girl', 'boy'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Gender must be either 'girl' or 'boy'",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      gender: gender.toLowerCase(),
      interests: Array.isArray(interests) ? interests : [],
      bio: bio || '',
      avatar: avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
      likesCarryOver: Boolean(likesCarryOver),
      likesRemaining: 3,
      role: 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Log in user / admin
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('currentRoomIds', 'name interestCategory');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/auth/preferences
// @desc    Update user preferences (likesCarryOver, bio, interests, avatar)
// @access  Private
router.patch('/preferences', protect, async (req, res, next) => {
  try {
    const { likesCarryOver, bio, interests, avatar } = req.body;

    const updates = {};
    if (typeof likesCarryOver === 'boolean') updates.likesCarryOver = likesCarryOver;
    if (bio !== undefined) updates.bio = bio;
    if (Array.isArray(interests)) updates.interests = interests;
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Preferences updated',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/demo-users
// @desc    Get quick demo credentials list for ease of testing
// @access  Public
router.get('/demo-users', async (req, res, next) => {
  try {
    const demoAccounts = await User.find({
      email: { $in: ['admin@mismatch.com', 'alex@mismatch.com', 'maya@mismatch.com', 'liam@mismatch.com', 'chloe@mismatch.com'] }
    }).select('name email gender role interests');

    res.json({
      success: true,
      demoAccounts,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
