const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  // Player 1
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  player1Name: {
    type: String,
    required: true
  },
  player1Points: {
    type: Number,
    default: 0
  },
  // Player 2
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  player2Name: {
    type: String,
    required: true
  },
  player2Points: {
    type: Number,
    default: 0
  },
  // Backward compatibility
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  playerName: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  },
  gameType: {
    type: String,
    enum: ['pool', 'snooker'],
    required: true
  },
  matchDate: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'draw', 'none'],
    default: 'none'
  },
  highestBreak: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  }
}, {
  timestamps: true
});

// Indexes for querying
matchSchema.index({ user1: 1, createdAt: -1 });
matchSchema.index({ user2: 1, createdAt: -1 });
matchSchema.index({ user: 1, createdAt: -1 });
matchSchema.index({ status: 1, startTime: 1 });
matchSchema.index({ startTime: -1 });

module.exports = mongoose.model('Match', matchSchema);
