const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  gameType: {
    type: String,
    enum: ['pool', 'snooker'],
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number,
    required: false,
    min: 0,
    default: null
  },
  endTime: {
    type: String,
    required: false,
    default: null
  },
  pricePerHour: {
    type: Number,
    required: false,
    default: null
  },
  totalAmount: {
    type: Number,
    required: false,
    default: null
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  requestStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  playerName: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for checking slot availability
bookingSchema.index({ bookingDate: 1, startTime: 1, gameType: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, startTime: 1 });
bookingSchema.index({ requestStatus: 1, bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
