const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  gameType: {
    type: String,
    enum: ['pool', 'snooker'],
    required: true,
    unique: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: '₹'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pricing', pricingSchema);
