const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/notification/vapid-public-key
 * @desc    Get VAPID public key for push notification subscription
 * @access  Public
 */
router.get('/vapid-public-key', (req, res) => {
  res.json({
    status: 'success',
    data: {
      publicKey: process.env.VAPID_PUBLIC_KEY
    }
  });
});

/**
 * @route   POST /api/notification/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 */
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid subscription data'
      });
    }

    // Check if subscription already exists
    const existing = await PushSubscription.findOne({
      user: req.user.id,
      endpoint: endpoint
    });

    if (existing) {
      // Update existing subscription
      existing.keys = keys;
      existing.userAgent = userAgent;
      existing.isActive = true;
      await existing.save();

      return res.json({
        status: 'success',
        message: 'Subscription updated',
        data: { subscription: existing }
      });
    }

    // Create new subscription
    const subscription = await PushSubscription.create({
      user: req.user.id,
      endpoint,
      keys,
      userAgent
    });

    console.log(`✓ Push subscription created for user ${req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Subscription created',
      data: { subscription }
    });
  } catch (error) {
    console.error('Subscribe Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to subscribe to notifications'
    });
  }
});

/**
 * @route   DELETE /api/notification/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 */
router.delete('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        status: 'error',
        message: 'Endpoint is required'
      });
    }

    const subscription = await PushSubscription.findOne({
      user: req.user.id,
      endpoint
    });

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'Subscription not found'
      });
    }

    await PushSubscription.findByIdAndDelete(subscription._id);

    console.log(`✓ Push subscription removed for user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('Unsubscribe Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsubscribe'
    });
  }
});

/**
 * @route   GET /api/notification/status
 * @desc    Check if user has active subscriptions
 * @access  Private
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const subscriptions = await PushSubscription.find({
      user: req.user.id,
      isActive: true
    });

    res.json({
      status: 'success',
      data: {
        subscribed: subscriptions.length > 0,
        count: subscriptions.length
      }
    });
  } catch (error) {
    console.error('Status Check Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check notification status'
    });
  }
});

module.exports = router;
