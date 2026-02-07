const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');
const adminMiddleware = require('../middleware/admin');
const jwt = require('jsonwebtoken');
const { applyDynamicStatusToMany } = require('../utils/bookingHelpers');
const { sendNotificationToUser, sendNotificationToAdmins } = require('../utils/pushNotification');

/**
 * Helper function to update user stats after match completion
 */
const updateUserStatsFromMatch = async (match) => {
  try {
    if (!match.user1 || !match.user2) return;
    
    const user1 = await User.findById(match.user1);
    const user2 = await User.findById(match.user2);
    
    if (!user1 || !user2) return;
    
    // Add match points to total points
    if (match.player1Points) {
      user1.stats.totalPoints = (user1.stats.totalPoints || 0) + match.player1Points;
    }
    if (match.player2Points) {
      user2.stats.totalPoints = (user2.stats.totalPoints || 0) + match.player2Points;
    }
    
    // Update wins/losses if match is completed
    if (match.status === 'completed' && match.player1Points !== undefined && match.player2Points !== undefined) {
      if (match.player1Points > match.player2Points) {
        user1.stats.totalWins = (user1.stats.totalWins || 0) + 1;
        user2.stats.totalLosses = (user2.stats.totalLosses || 0) + 1;
      } else if (match.player2Points > match.player1Points) {
        user2.stats.totalWins = (user2.stats.totalWins || 0) + 1;
        user1.stats.totalLosses = (user1.stats.totalLosses || 0) + 1;
      }
    }
    
    await user1.save();
    await user2.save();
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

/**
 * @route   POST /api/admin/login
 * @desc    Admin login with mobile and password
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // For demo: admin mobile is 0000000000, password is admin123
    if (mobile === '0000000000' && password === 'admin123') {
      // Find or create admin user
      let admin = await User.findOne({ mobile: '0000000000' });
      
      if (!admin) {
        admin = new User({
          mobile: '0000000000',
          name: 'Admin',
          role: 'admin'
        });
        await admin.save();
      } else {
        // Update role to admin if not already
        if (admin.role !== 'admin') {
          admin.role = 'admin';
          await admin.save();
        }
      }

      // Generate token
      const token = jwt.sign(
        { userId: admin._id },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      return res.json({
        status: 'success',
        message: 'Admin login successful',
        data: {
          token,
          user: {
            id: admin._id,
            mobile: admin.mobile,
            name: admin.name,
            role: admin.role
          }
        }
      });
    }

    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-lastOTP -otpExpiry')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

/**
 * @route   GET /api/admin/matches
 * @desc    Get all matches
 * @access  Admin
 */
router.get('/matches', adminMiddleware, async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('user', 'name mobile')
      .sort({ matchDate: -1 })
      .limit(100);

    res.json({
      status: 'success',
      data: {
        matches,
        count: matches.length
      }
    });
  } catch (error) {
    console.error('Get Matches Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch matches'
    });
  }
});

/**
 * @route   POST /api/admin/match
 * @desc    Create match record with player selection and status
 * @access  Admin
 */
router.post('/match', adminMiddleware, async (req, res) => {
  try {
    const { 
      player1Id, player2Id,
      gameType, status,
      player1Points, player2Points
    } = req.body;

    // Validate required fields
    if (!player1Id || !player2Id || !gameType || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both players, game type, and status'
      });
    }

    // Find users
    const user1 = await User.findById(player1Id);
    const user2 = await User.findById(player2Id);

    if (!user1 || !user2) {
      return res.status(404).json({
        status: 'error',
        message: 'One or both players not found'
      });
    }

    // Create match
    const now = new Date();
    const match = new Match({
      user1: user1._id,
      player1Name: user1.name,
      player1Points: player1Points || 0,
      user2: user2._id,
      player2Name: user2.name,
      player2Points: player2Points || 0,
      gameType,
      matchDate: now,
      startTime: now.toTimeString().slice(0, 5),
      endTime: '',
      duration: 0,
      amountPaid: 0,
      status: status || 'ongoing'
    });

    await match.save();

    res.json({
      status: 'success',
      message: 'Match created successfully',
      data: { match }
    });
  } catch (error) {
    console.error('Create Match Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create match record',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/match/:id
 * @desc    Update match points and/or status
 * @access  Admin
 */
router.patch('/match/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { player1Points, player2Points, status } = req.body;

    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({
        status: 'error',
        message: 'Match not found'
      });
    }

    // Update points if provided
    if (player1Points !== undefined) match.player1Points = parseInt(player1Points);
    if (player2Points !== undefined) match.player2Points = parseInt(player2Points);
    
    // Update status if provided
    if (status && ['ongoing', 'completed'].includes(status)) {
      const wasCompleted = match.status === 'completed';
      match.status = status;
      // Set end time when match is completed
      if (status === 'completed' && !match.endTime) {
        match.endTime = new Date().toTimeString().slice(0, 5);
      }
      
      // Update user stats when match is completed
      if (status === 'completed' && !wasCompleted) {
        await updateUserStatsFromMatch(match);
        
        // Send notifications to both players about match completion
        const populatedMatch = await Match.findById(match._id)
          .populate('player1', 'name _id')
          .populate('player2', 'name _id');
        
        if (populatedMatch.player1 && populatedMatch.player2) {
          const winner = match.player1Points > match.player2Points ? populatedMatch.player1 : populatedMatch.player2;
          const isPlayer1Winner = match.player1Points > match.player2Points;
          
          // Notify player 1
          sendNotificationToUser(populatedMatch.player1._id, {
            title: isPlayer1Winner ? '🏆 Victory!' : '💪 Match Completed',
            body: `Your ${match.gameType} match vs ${populatedMatch.player2.name} ended ${match.player1Points}-${match.player2Points}`,
            data: {
              type: 'match_completed',
              matchId: match._id.toString(),
              result: isPlayer1Winner ? 'won' : 'lost',
              url: '/dashboard'
            },
            tag: 'match-completed',
            requireInteraction: true
          }).catch(err => console.error('Failed to send notification:', err));
          
          // Notify player 2
          sendNotificationToUser(populatedMatch.player2._id, {
            title: !isPlayer1Winner ? '🏆 Victory!' : '💪 Match Completed',
            body: `Your ${match.gameType} match vs ${populatedMatch.player1.name} ended ${match.player2Points}-${match.player1Points}`,
            data: {
              type: 'match_completed',
              matchId: match._id.toString(),
              result: !isPlayer1Winner ? 'won' : 'lost',
              url: '/dashboard'
            },
            tag: 'match-completed',
            requireInteraction: true
          }).catch(err => console.error('Failed to send notification:', err));
          
          // Notify admins about match completion
          sendNotificationToAdmins({
            title: '🎮 Match Completed',
            body: `${populatedMatch.player1.name} vs ${populatedMatch.player2.name} - ${match.player1Points}:${match.player2Points}`,
            data: {
              type: 'match_completed_admin',
              matchId: match._id.toString(),
              url: '/admin/dashboard?tab=matches'
            },
            tag: 'match-admin'
          }).catch(err => console.error('Failed to send notification:', err));
        }
      }
    }

    await match.save();

    res.json({
      status: 'success',
      message: 'Match updated successfully',
      data: { match }
    });
  } catch (error) {
    console.error('Update Match Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update match',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all accepted bookings (excludes pending requests)
 * @access  Admin
 */
router.get('/bookings', adminMiddleware, async (req, res) => {
  try {
    // Only get accepted or declined bookings, not pending
    const bookings = await Booking.find({
      requestStatus: { $in: ['accepted', 'declined'] }
    })
      .populate('user', 'name mobile')
      .sort({ bookingDate: -1, startTime: -1 })
      .limit(100);

    // Apply dynamic status based on current time
    const bookingsWithStatus = applyDynamicStatusToMany(bookings);

    res.json({
      status: 'success',
      data: {
        bookings: bookingsWithStatus,
        count: bookingsWithStatus.length
      }
    });
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

/**
 * @route   GET /api/admin/booking-requests
 * @desc    Get pending booking requests
 * @access  Admin
 */
router.get('/booking-requests', adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ requestStatus: 'pending' })
      .populate('user', 'name mobile')
      .sort({ createdAt: -1 });

    // Apply dynamic status based on current time
    const bookingsWithStatus = applyDynamicStatusToMany(bookings);

    res.json({
      status: 'success',
      data: {
        bookings: bookingsWithStatus,
        count: bookingsWithStatus.length
      }
    });
  } catch (error) {
    console.error('Get Booking Requests Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking requests'
    });
  }
});

/**
 * @route   POST /api/admin/booking
 * @desc    Create booking record manually (can be partial, updated later)
 * @access  Admin
 */
router.post('/booking', adminMiddleware, async (req, res) => {
  try {
    const { playerName, mobile, gameType, bookingDate, startTime, endTime, duration, amount } = req.body;

    // Validate input
    if (!playerName || !gameType || !bookingDate || !startTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields (playerName, gameType, bookingDate, startTime)'
      });
    }

    // Find user by mobile if provided
    let user = null;
    if (mobile) {
      user = await User.findOne({ mobile });
    }

    // Create booking data - allow null for optional fields
    const bookingData = {
      user: user?._id || null,
      playerName,
      gameType,
      bookingDate: new Date(bookingDate),
      startTime,
      status: 'upcoming',
      requestStatus: 'accepted' // Admin bookings are auto-accepted
    };

    // Add optional fields only if provided
    if (endTime) bookingData.endTime = endTime;
    if (duration) bookingData.duration = parseFloat(duration);
    if (amount) {
      bookingData.amountPaid = parseFloat(amount);
      bookingData.totalAmount = parseFloat(amount);
    }

    const booking = new Booking(bookingData);
    await booking.save();

    res.json({
      status: 'success',
      message: 'Booking record created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking record',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/booking/:id
 * @desc    Update booking record
 * @access  Admin
 */
router.patch('/booking/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { playerName, mobile, gameType, bookingDate, startTime, endTime, duration, amount, status } = req.body;

    // Find booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Update fields if provided
    if (playerName) booking.playerName = playerName;
    if (gameType) booking.gameType = gameType;
    if (bookingDate) booking.bookingDate = new Date(bookingDate);
    if (startTime) booking.startTime = startTime;
    if (endTime) booking.endTime = endTime;
    if (duration) booking.duration = parseFloat(duration);
    if (amount) {
      booking.amountPaid = parseFloat(amount);
      booking.totalAmount = parseFloat(amount);
    }
    if (status) booking.status = status;

    // Update user if mobile provided
    if (mobile) {
      const user = await User.findOne({ mobile });
      if (user) {
        booking.user = user._id;
      }
    }

    await booking.save();

    res.json({
      status: 'success',
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update Booking Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/booking/:id
 * @desc    Delete booking record
 * @access  Admin
 */
router.delete('/booking/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete Booking Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/booking/:id/accept
 * @desc    Accept a booking request
 * @access  Admin
 */
router.patch('/booking/:id/accept', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.requestStatus === 'accepted') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking is already accepted'
      });
    }

    booking.requestStatus = 'accepted';
    await booking.save();

    // Send notification to user about booking approval
    const userId = booking.user;
    if (userId) {
      console.log(`✓ Sending booking approval notification to user ${userId}`);
      sendNotificationToUser(userId, {
        title: '✅ Booking Approved!',
        body: `Your ${booking.gameType} booking for ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.startTime} has been approved`,
        data: {
          type: 'booking_approved',
          bookingId: booking._id.toString(),
          url: '/dashboard'
        },
        tag: 'booking-approved',
        requireInteraction: true
      }).catch(err => console.error('Failed to send notification:', err));
    } else {
      console.log('⚠ No user ID found on booking');
    }

    res.json({
      status: 'success',
      message: 'Booking accepted successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Accept Booking Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to accept booking',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/booking/:id/decline
 * @desc    Decline a booking request
 * @access  Admin
 */
router.patch('/booking/:id/decline', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    if (booking.requestStatus === 'declined') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking is already declined'
      });
    }

    booking.requestStatus = 'declined';
    booking.status = 'cancelled';
    await booking.save();

    // Send notification to user about booking decline
    const userId = booking.user;
    if (userId) {
      console.log(`✓ Sending booking decline notification to user ${userId}`);
      sendNotificationToUser(userId, {
        title: '❌ Booking Declined',
        body: `Your ${booking.gameType} booking request for ${new Date(booking.bookingDate).toLocaleDateString()} has been declined`,
        data: {
          type: 'booking_declined',
          bookingId: booking._id.toString(),
          url: '/dashboard'
        },
        tag: 'booking-declined'
      }).catch(err => console.error('Failed to send notification:', err));
    }

    res.json({
      status: 'success',
      message: 'Booking declined successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Decline Booking Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to decline booking',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard stats
 * @access  Admin
 */
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    // Get today's date range
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Total stats
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalMatches = await Match.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Match.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    // Today's stats
    const todayMatches = await Match.countDocuments({
      matchDate: { $gte: todayStart, $lt: todayEnd }
    });
    const todayBookings = await Booking.countDocuments({
      bookingDate: { $gte: todayStart, $lt: todayEnd }
    });
    const todayRevenueData = await Match.aggregate([
      { 
        $match: { 
          matchDate: { $gte: todayStart, $lt: todayEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalMatches,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayMatches,
        todayBookings,
        todayRevenue: todayRevenueData[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stats'
    });
  }
});

/**
 * @route   PATCH /api/admin/user/:id/stats
 * @desc    Update user stats manually
 * @access  Admin
 */
router.patch('/user/:id/stats', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { totalWins, totalLosses, totalPoints, highestBreak } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update stats
    if (totalWins !== undefined) user.stats.totalWins = parseInt(totalWins);
    if (totalLosses !== undefined) user.stats.totalLosses = parseInt(totalLosses);
    if (totalPoints !== undefined) user.stats.totalPoints = parseInt(totalPoints);
    if (highestBreak !== undefined) user.stats.highestBreak = parseInt(highestBreak);

    await user.save();

    res.json({
      status: 'success',
      message: 'User stats updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update User Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user stats',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/user/:id/recalculate-stats
 * @desc    Recalculate user stats from matches
 * @access  Admin
 */
router.post('/user/:id/recalculate-stats', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Calculate stats from matches
    const matches = await Match.find({ user: id, status: 'completed' });
    
    const stats = {
      totalWins: matches.filter(m => m.result === 'win').length,
      totalLosses: matches.filter(m => m.result === 'loss').length,
      totalPoints: matches.reduce((sum, m) => sum + (m.points || 0), 0),
      highestBreak: Math.max(0, ...matches.map(m => m.highestBreak || 0))
    };

    user.stats = stats;
    await user.save();

    res.json({
      status: 'success',
      message: 'User stats recalculated successfully',
      data: { user, stats }
    });
  } catch (error) {
    console.error('Recalculate User Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to recalculate user stats',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/user/:id/stats
 * @desc    Update user stats (points, wins, losses, highest break)
 * @access  Admin
 */
router.patch('/user/:id/stats', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { totalPoints, totalWins, totalLosses, highestBreak } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update stats
    if (totalPoints !== undefined) user.stats.totalPoints = parseInt(totalPoints);
    if (totalWins !== undefined) user.stats.totalWins = parseInt(totalWins);
    if (totalLosses !== undefined) user.stats.totalLosses = parseInt(totalLosses);
    if (highestBreak !== undefined) user.stats.highestBreak = parseInt(highestBreak);

    await user.save();

    res.json({
      status: 'success',
      message: 'User stats updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update User Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user stats',
      error: error.message
    });
  }
});

module.exports = router;
