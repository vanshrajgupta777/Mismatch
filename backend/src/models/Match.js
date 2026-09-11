import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    userAId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userBId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    matchedAt: {
      type: Date,
      default: Date.now,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index to find matches involving a given user
matchSchema.index({ userAId: 1, userBId: 1 });
matchSchema.index({ userBId: 1, userAId: 1 });

export const Match = mongoose.model('Match', matchSchema);
