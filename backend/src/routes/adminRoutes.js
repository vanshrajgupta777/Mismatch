import express from 'express';
import { Room } from '../models/Room.js';
import { User } from '../models/User.js';
import { Match } from '../models/Match.js';
import { Like } from '../models/Like.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { resetWeeklyLikes } from '../services/cronService.js';

const router = express.Router();

// Apply auth and requireAdmin to all admin routes
router.use(protect, requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get system overview stats
// @access  Admin
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const girlCount = await User.countDocuments({ role: 'user', gender: 'girl' });
    const boyCount = await User.countDocuments({ role: 'user', gender: 'boy' });
    const totalRooms = await Room.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalLikes = await Like.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        girlCount,
        boyCount,
        totalRooms,
        totalMatches,
        totalLikes,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/rooms
// @desc    Create a new room (admin only)
// @access  Admin
router.post('/rooms', async (req, res, next) => {
  try {
    const { name, interestCategory, description, capacity } = req.body;

    if (!name || !interestCategory) {
      return res.status(400).json({
        success: false,
        message: 'Name and interest category are required',
      });
    }

    const room = await Room.create({
      name,
      interestCategory,
      description: description || '',
      capacity: {
        girls: capacity?.girls || 25,
        boys: capacity?.boys || 25,
      },
      createdBy: req.user._id,
      members: [],
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/rooms/:id
// @desc    Update room details or capacity
// @access  Admin
router.patch('/rooms/:id', async (req, res, next) => {
  try {
    const { name, interestCategory, description, capacity, isActive } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (name) room.name = name;
    if (interestCategory) room.interestCategory = interestCategory;
    if (description !== undefined) room.description = description;
    if (capacity?.girls) room.capacity.girls = capacity.girls;
    if (capacity?.boys) room.capacity.boys = capacity.boys;
    if (typeof isActive === 'boolean') room.isActive = isActive;

    await room.save();

    res.json({
      success: true,
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/admin/rooms/:id
// @desc    Delete a room
// @access  Admin
router.delete('/rooms/:id', async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Clean up currentRoomIds in users
    await User.updateMany(
      { currentRoomIds: room._id },
      { $pull: { currentRoomIds: room._id } }
    );

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/rooms/:id/move-user
// @desc    Move or assign a user to a room
// @access  Admin
router.post('/rooms/:id/move-user', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is already in room
    const isMember = room.members.some(
      (m) => m.userId.toString() === user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already in this room',
      });
    }

    // Add to room
    room.members.push({
      userId: user._id,
      gender: user.gender,
      joinedAt: new Date(),
    });
    await room.save();

    await User.findByIdAndUpdate(user._id, {
      $addToSet: { currentRoomIds: room._id },
    });

    res.json({
      success: true,
      message: `User ${user.name} placed into ${room.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/rooms/:id/remove-user
// @desc    Remove a user from a room
// @access  Admin
router.post('/rooms/:id/remove-user', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.members = room.members.filter(
      (m) => m.userId.toString() !== userId.toString()
    );
    await room.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { currentRoomIds: room._id },
    });

    res.json({
      success: true,
      message: 'User removed from room successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/admin/users
// @desc    Get user list with filters
// @access  Admin
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('currentRoomIds', 'name interestCategory')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Update user verification status
// @access  Admin
router.patch('/users/:id/verify', async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    if (!['unverified', 'pending', 'verified'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: `User verification updated to ${verificationStatus}`,
      user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/admin/reset-likes
// @desc    Manually trigger weekly likes refresh (for testing & demo)
// @access  Admin
router.post('/reset-likes', async (req, res, next) => {
  try {
    const result = await resetWeeklyLikes();
    res.json({
      success: true,
      message: 'Weekly likes successfully refreshed!',
      result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
