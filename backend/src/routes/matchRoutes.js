import express from 'express';
import { Match } from '../models/Match.js';
import { Chat } from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/matches
// @desc    Get all active matches for current user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const matches = await Match.find({
      $or: [{ userAId: currentUserId }, { userBId: currentUserId }],
      isActive: true,
    })
      .populate('userAId', 'name gender avatar interests bio verificationStatus')
      .populate('userBId', 'name gender avatar interests bio verificationStatus')
      .populate('roomId', 'name interestCategory')
      .populate('chatId', 'lastMessage lastMessageAt')
      .sort({ matchedAt: -1 });

    const formattedMatches = matches.map((match) => {
      const isUserA = match.userAId._id.toString() === currentUserId.toString();
      const matchedUser = isUserA ? match.userBId : match.userAId;

      return {
        _id: match._id,
        matchedAt: match.matchedAt,
        room: match.roomId,
        chatId: match.chatId?._id,
        lastMessage: match.chatId?.lastMessage || '',
        lastMessageAt: match.chatId?.lastMessageAt || match.matchedAt,
        matchedUser: {
          _id: matchedUser._id,
          name: matchedUser.name,
          gender: matchedUser.gender,
          avatar: matchedUser.avatar,
          interests: matchedUser.interests,
          bio: matchedUser.bio,
          verificationStatus: matchedUser.verificationStatus,
        },
      };
    });

    res.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/matches/:id
// @desc    Get single match details
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('userAId', 'name gender avatar interests bio')
      .populate('userBId', 'name gender avatar interests bio')
      .populate('roomId', 'name interestCategory');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found',
      });
    }

    const currentUserId = req.user._id.toString();
    if (
      match.userAId._id.toString() !== currentUserId &&
      match.userBId._id.toString() !== currentUserId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this match',
      });
    }

    const matchedUser =
      match.userAId._id.toString() === currentUserId
        ? match.userBId
        : match.userAId;

    res.json({
      success: true,
      match: {
        _id: match._id,
        matchedAt: match.matchedAt,
        room: match.roomId,
        chatId: match.chatId,
        matchedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
