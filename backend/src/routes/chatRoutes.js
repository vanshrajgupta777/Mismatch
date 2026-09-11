import express from 'express';
import { Match } from '../models/Match.js';
import { Chat } from '../models/Chat.js';
import { protect } from '../middleware/auth.js';
import { emitToChat } from '../services/socketService.js';

const router = express.Router();

// Helper to verify user belongs to match
const verifyMatchAccess = async (matchId, userId, role) => {
  const match = await Match.findById(matchId);
  if (!match) return null;

  const isUser =
    match.userAId.toString() === userId.toString() ||
    match.userBId.toString() === userId.toString();

  if (!isUser && role !== 'admin') {
    return false;
  }
  return match;
};

// @route   GET /api/chat/:matchId
// @desc    Get messages for a match
// @access  Private
router.get('/:matchId', protect, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const match = await verifyMatchAccess(matchId, req.user._id, req.user.role);

    if (match === null) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    if (match === false) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let chat = await Chat.findOne({ matchId }).populate(
      'messages.senderId',
      'name avatar gender'
    );

    if (!chat) {
      chat = await Chat.create({
        matchId,
        messages: [],
      });
    }

    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat/:matchId/message
// @desc    Send a message within a match
// @access  Private
router.post('/:matchId/message', protect, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty',
      });
    }

    const match = await verifyMatchAccess(matchId, req.user._id, req.user.role);
    if (match === null) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    if (match === false) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    let chat = await Chat.findOne({ matchId });
    if (!chat) {
      chat = new Chat({ matchId, messages: [] });
    }

    const newMessage = {
      senderId: req.user._id,
      text: text.trim(),
      sentAt: new Date(),
      read: false,
    };

    chat.messages.push(newMessage);
    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    const populatedSender = {
      _id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
      gender: req.user.gender,
    };

    const socketPayload = {
      _id: chat.messages[chat.messages.length - 1]._id,
      matchId,
      senderId: populatedSender,
      text: text.trim(),
      sentAt: newMessage.sentAt,
      read: false,
    };

    // Emit live message to the chat room
    emitToChat(matchId, 'new_message', socketPayload);

    res.status(201).json({
      success: true,
      message: socketPayload,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
