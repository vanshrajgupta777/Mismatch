import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    weekOf: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent same user from liking same person multiple times in same room in same week cycle
likeSchema.index({ fromUserId: 1, toUserId: 1, roomId: 1, weekOf: 1 }, { unique: true });

export const Like = mongoose.model('Like', likeSchema);
