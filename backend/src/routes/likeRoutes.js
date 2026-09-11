import express from 'express';
import { Like } from '../models/Like.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { Match } from '../models/Match.js';
import { Chat } from '../models/Chat.js';
import { protect } from '../middleware/auth.js';
import { getWeekCycleDate } from '../services/cronService.js';
import { emitToUser } from '../services/socketService.js';

const router = express.Router();

// @route   POST /api/likes
// @desc    Send a blind like to another member in the same room
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { toUserId, roomId } = req.body;
    const fromUserId = req.user._id;

    if (!toUserId || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide toUserId and roomId',
      });
    }

    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot like yourself',
      });
    }

    // Refresh user to get latest likesRemaining
    const sender = await User.findById(fromUserId);
    if (!sender) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (sender.likesRemaining <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'No likes remaining this week! Your likes will refresh next cycle.',
      });
    }

    // Check room existence and membership
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const senderInRoom = room.members.some(
      (m) => m.userId.toString() === fromUserId.toString()
    );
    if (!senderInRoom) {
      return res.status(400).json({
        success: false,
        message: 'You must be a member of this room to send a like',
      });
    }

    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found',
      });
    }

    const recipientInRoom = room.members.some(
      (m) => m.userId.toString() === toUserId.toString()
    );
    if (!recipientInRoom) {
      return res.status(400).json({
        success: false,
        message: 'Recipient is not a member of this room',
      });
    }

    // Enforce opposite gender like rule (Girl <-> Boy)
    if (sender.gender === recipient.gender && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Mismatch is configured for opposite-gender matching',
      });
    }

    // Current week cycle date
    const weekOf = getWeekCycleDate();

    // Check for duplicate like in this cycle
    const alreadyLiked = await Like.findOne({
      fromUserId,
      toUserId,
      roomId,
      weekOf,
    });

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this member during this weekly cycle',
      });
    }

    // Create Like
    await Like.create({
      fromUserId,
      toUserId,
      roomId,
      weekOf,
    });

    // Decrement likesRemaining
    sender.likesRemaining = Math.max(0, sender.likesRemaining - 1);
    await sender.save();

    // Check for reciprocal like (did the other person like this sender in the same room?)
    const reciprocalLike = await Like.findOne({
      fromUserId: toUserId,
      toUserId: fromUserId,
      roomId,
    });

    let isMatch = false;
    let matchData = null;

    if (reciprocalLike) {
      // Mutual like detected -> CREATE MATCH!
      // Check if match already exists
      let match = await Match.findOne({
        $or: [
          { userAId: fromUserId, userBId: toUserId, roomId },
          { userAId: toUserId, userBId: fromUserId, roomId },
        ],
      });

      if (!match) {
        match = await Match.create({
          userAId: fromUserId,
          userBId: toUserId,
          roomId,
          matchedAt: new Date(),
        });

        // Create Chat instance for this match
        const chat = await Chat.create({
          matchId: match._id,
          messages: [
            {
              senderId: fromUserId,
              text: "It's a Match! Chat is now unlocked.",
              sentAt: new Date(),
            },
          ],
          lastMessage: "It's a Match! Chat is now unlocked.",
          lastMessageAt: new Date(),
        });

        match.chatId = chat._id;
        await match.save();

        isMatch = true;
        matchData = {
          matchId: match._id,
          chatId: chat._id,
          roomId,
          roomName: room.name,
          matchedUser: {
            _id: recipient._id,
            name: recipient.name,
            gender: recipient.gender,
            avatar: recipient.avatar,
            interests: recipient.interests,
          },
        };

        // Emit real-time notification to both users
        emitToUser(toUserId, 'match_found', {
          matchId: match._id,
          chatId: chat._id,
          roomId,
          roomName: room.name,
          matchedUser: {
            _id: sender._id,
            name: sender.name,
            gender: sender.gender,
            avatar: sender.avatar,
            interests: sender.interests,
          },
        });

        emitToUser(fromUserId, 'match_found', matchData);
      }
    }

    res.status(201).json({
      success: true,
      isMatch,
      match: matchData,
      likesRemaining: sender.likesRemaining,
      message: isMatch
        ? "It's a Match! Chat unlocked!"
        : 'Like sent secretly. If they like you back, you will be notified!',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/likes/remaining
// @desc    Get user's remaining likes and carry-over status
// @access  Private
router.get('/remaining', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'likesRemaining likesCarryOver'
    );
    res.json({
      success: true,
      likesRemaining: user.likesRemaining,
      likesCarryOver: user.likesCarryOver,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
