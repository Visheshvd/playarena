const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');

/**
 * @route   GET /api/pricing
 * @desc    Get all pricing information
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const pricing = await Pricing.find({ isActive: true });

    res.json({
      status: 'success',
      data: {
        pricing: pricing.map(p => ({
          gameType: p.gameType,
          pricePerHour: p.pricePerHour,
          currency: p.currency,
          displayText: `${p.currency}${p.pricePerHour} / hour`
        }))
      }
    });
  } catch (error) {
    console.error('Get Pricing Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pricing'
    });
  }
});

module.exports = router;
