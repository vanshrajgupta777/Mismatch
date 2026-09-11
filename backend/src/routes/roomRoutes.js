import express from 'express';
import { Room } from '../models/Room.js';
import { User } from '../models/User.js';
import { Like } from '../models/Like.js';
import { protect } from '../middleware/auth.js';
import { getWeekCycleDate } from '../services/cronService.js';

const router = express.Router();

// @route   GET /api/rooms
// @desc    List all active rooms with capacity details
// @access  Public (or Private)
router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ createdAt: -1 });

    const roomsWithCounts = rooms.map((room) => {
      const girlCount = room.members.filter((m) => m.gender === 'girl').length;
      const boyCount = room.members.filter((m) => m.gender === 'boy').length;
      return {
        _id: room._id,
        name: room.name,
        interestCategory: room.interestCategory,
        description: room.description,
        capacity: room.capacity,
        girlCount,
        boyCount,
        totalMembers: girlCount + boyCount,
        isGirlFull: girlCount >= room.capacity.girls,
        isBoyFull: boyCount >= room.capacity.boys,
        createdAt: room.createdAt,
      };
    });

    res.json({
      success: true,
      rooms: roomsWithCounts,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rooms/:id
// @desc    Get details of a single room
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const girlCount = room.members.filter((m) => m.gender === 'girl').length;
    const boyCount = room.members.filter((m) => m.gender === 'boy').length;
    const isMember = room.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      room: {
        _id: room._id,
        name: room.name,
        interestCategory: room.interestCategory,
        description: room.description,
        capacity: room.capacity,
        girlCount,
        boyCount,
        totalMembers: girlCount + boyCount,
        isMember,
        isFullForMe:
          req.user.gender === 'girl'
            ? girlCount >= room.capacity.girls
            : boyCount >= room.capacity.boys,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Join a room (respects strict 25 capacity per gender)
// @access  Private
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const userGender = req.user.gender;
    if (!userGender || !['girl', 'boy'].includes(userGender)) {
      return res.status(400).json({
        success: false,
        message: 'User gender not set or invalid',
      });
    }

    // Check if already a member
    const alreadyMember = room.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this room',
      });
    }

    // Hard capacity check for the user's gender
    const currentGenderCount = room.members.filter(
      (m) => m.gender === userGender
    ).length;
    const maxCapacity =
      userGender === 'girl' ? room.capacity.girls : room.capacity.boys;

    if (currentGenderCount >= maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `This room is full for ${userGender}s (${currentGenderCount}/${maxCapacity}). Please join another room or check back later.`,
      });
    }

    // Add user to room
    room.members.push({
      userId: req.user._id,
      gender: userGender,
      joinedAt: new Date(),
    });
    await room.save();

    // Update user's currentRoomIds
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { currentRoomIds: room._id },
    });

    res.json({
      success: true,
      message: `Successfully joined ${room.name}`,
      roomId: room._id,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rooms/:id/leave
// @desc    Leave/shuffle out of a room
// @access  Private
router.post('/:id/leave', protect, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Remove member from room
    room.members = room.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );
    await room.save();

    // Remove room from user's currentRoomIds
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { currentRoomIds: room._id },
    });

    res.json({
      success: true,
      message: `Successfully left ${room.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rooms/:id/members
// @desc    Get blind profiles of opposite-gender members in this room
// @access  Private
router.get('/:id/members', protect, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is a member of the room
    const isUserInRoom = room.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (!isUserInRoom && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You must join this room to view its members',
      });
    }

    // Target opposite gender: if girl -> boy, if boy -> girl
    // Admin can view both or filter
    const targetGender = req.user.gender === 'girl' ? 'boy' : 'girl';

    const targetMemberEntries = room.members.filter(
      (m) => req.user.role === 'admin' || m.gender === targetGender
    );
    const targetUserIds = targetMemberEntries.map((m) => m.userId);

    // Fetch user details (blind: NO like counters, NO who liked who)
    const members = await User.find({
      _id: { $in: targetUserIds },
    }).select('name gender interests bio avatar verificationStatus createdAt');

    // Find which members the current user has ALREADY liked during the current week cycle
    const currentWeek = getWeekCycleDate();
    const existingLikes = await Like.find({
      fromUserId: req.user._id,
      roomId: room._id,
      weekOf: currentWeek,
    }).select('toUserId');

    const likedUserIds = new Set(existingLikes.map((l) => l.toUserId.toString()));

    const blindProfiles = members.map((member) => ({
      _id: member._id,
      name: member.name,
      gender: member.gender,
      interests: member.interests,
      bio: member.bio,
      avatar: member.avatar,
      verificationStatus: member.verificationStatus,
      hasLikedThisWeek: likedUserIds.has(member._id.toString()),
    }));

    res.json({
      success: true,
      roomName: room.name,
      interestCategory: room.interestCategory,
      oppositeGender: targetGender,
      members: blindProfiles,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
