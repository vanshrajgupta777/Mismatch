import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    interestCategory: {
      type: String,
      required: [true, 'Interest category is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    capacity: {
      girls: {
        type: Number,
        default: 25,
      },
      boys: {
        type: Number,
        default: 25,
      },
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        gender: {
          type: String,
          enum: ['girl', 'boy'],
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Virtual for total member counts
roomSchema.virtual('girlCount').get(function () {
  return this.members ? this.members.filter((m) => m.gender === 'girl').length : 0;
});

roomSchema.virtual('boyCount').get(function () {
  return this.members ? this.members.filter((m) => m.gender === 'boy').length : 0;
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

export const Room = mongoose.model('Room', roomSchema);
