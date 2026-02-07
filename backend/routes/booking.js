const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');
const Match = require('../models/Match');
const authMiddleware = require('../middleware/auth');
const { applyDynamicStatusToMany } = require('../utils/bookingHelpers');
const { sendNotificationToAdmins } = require('../utils/pushNotification');

/**
 * Helper function to check if time is within booking hours (11 AM - 11 PM)
 */
const isWithinBookingHours = (hour) => {
  const startHour = parseInt(process.env.BOOKING_START_HOUR) || 11;
  const endHour = parseInt(process.env.BOOKING_END_HOUR) || 23;
  return hour >= startHour && hour < endHour;
};

/**
 * Helper function to calculate end time
 */
const calculateEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  let endHour = hours + duration;
  const endMinutes = minutes;
  
  // Handle overflow
  if (endHour >= 24) {
    endHour = endHour % 24;
  }
  
  return `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

/**
 * Helper function to check slot overlaps
 */
const checkSlotOverlap = async (gameType, bookingDate, startTime, duration) => {
  const endTime = calculateEndTime(startTime, duration);
  
  const dateStart = new Date(bookingDate);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(bookingDate);
  dateEnd.setHours(23, 59, 59, 999);

  const overlappingBookings = await Booking.find({
    gameType,
    bookingDate: {
      $gte: dateStart,
      $lte: dateEnd
    },
    requestStatus: 'accepted', // Only check accepted bookings
    status: { $in: ['upcoming', 'ongoing'] }
  });

  // Check for time overlap
  const [reqStartHour, reqStartMin] = startTime.split(':').map(Number);
  const [reqEndHour, reqEndMin] = endTime.split(':').map(Number);
  const reqStart = reqStartHour * 60 + reqStartMin;
  const reqEnd = reqEndHour * 60 + reqEndMin;

  for (const booking of overlappingBookings) {
    const [bookStartHour, bookStartMin] = booking.startTime.split(':').map(Number);
    const [bookEndHour, bookEndMin] = booking.endTime.split(':').map(Number);
    const bookStart = bookStartHour * 60 + bookStartMin;
    const bookEnd = bookEndHour * 60 + bookEndMin;

    // Check if intervals overlap
    if (reqStart < bookEnd && reqEnd > bookStart) {
      return true; // Overlap found
    }
  }

  return false; // No overlap
};

/**
 * @route   POST /api/booking/create
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { gameType, bookingDate, startTime, endTime, duration, amount, playerName } = req.body;

    // Validation
    if (!gameType || !['pool', 'snooker'].includes(gameType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid game type. Must be "pool" or "snooker"'
      });
    }

    if (!bookingDate || !startTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking date and start time are required'
      });
    }

    // Validate time format
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid start time format. Use HH:MM'
      });
    }

    // Calculate duration and endTime if not provided
    let finalDuration = duration;
    let finalEndTime = endTime;
    
    if (endTime && !duration) {
      // Calculate duration from times
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle next day
      finalDuration = diffMinutes / 60;
    } else if (duration && !endTime) {
      // Calculate endTime from duration
      finalEndTime = calculateEndTime(startTime, duration);
    } else if (!duration && !endTime) {
      // Default to 1 hour if neither provided
      finalDuration = 1;
      finalEndTime = calculateEndTime(startTime, 1);
    }

    // Validate duration if provided
    if (finalDuration && (finalDuration < 0.5 || finalDuration > 12)) {
      return res.status(400).json({
        status: 'error',
        message: 'Duration must be between 0.5 and 12 hours'
      });
    }

    // Validate endTime format if provided
    if (finalEndTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(finalEndTime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid end time format. Use HH:MM'
      });
    }

    // Check booking hours
    const [hour] = startTime.split(':').map(Number);
    if (!isWithinBookingHours(hour)) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking allowed only between 11:00 AM and 11:00 PM'
      });
    }

    // Check for overlapping bookings if duration is available
    if (finalDuration) {
      const hasOverlap = await checkSlotOverlap(gameType, bookingDate, startTime, finalDuration);
      if (hasOverlap) {
        return res.status(400).json({
          status: 'error',
          message: 'This slot is already booked. Please choose another time.'
        });
      }
    }

    // Get pricing
    const pricing = await Pricing.findOne({ gameType, isActive: true });
    if (!pricing) {
      return res.status(400).json({
        status: 'error',
        message: 'Pricing not available for this game type'
      });
    }

    // Calculate total amount
    let totalAmount = amount || 0;
    if (finalDuration && !amount) {
      totalAmount = pricing.pricePerHour * finalDuration;
    }

    // Create booking with pending status
    const booking = new Booking({
      user: req.user._id,
      gameType,
      bookingDate: new Date(bookingDate),
      startTime,
      duration: finalDuration || 0,
      endTime: finalEndTime,
      pricePerHour: pricing.pricePerHour,
      totalAmount,
      playerName: playerName || req.user.name || 'Player',
      status: 'upcoming',
      requestStatus: 'pending'
    });

    await booking.save();

    // Send notification to admins about new booking request
    sendNotificationToAdmins({
      title: '🎱 New Booking Request',
      body: `${playerName || req.user.name} requested a ${gameType} booking for ${new Date(bookingDate).toLocaleDateString()}`,
      data: {
        type: 'booking_request',
        bookingId: booking._id.toString(),
        url: '/admin/dashboard?tab=requests'
      },
      tag: 'booking-request',
      requireInteraction: true
    }).catch(err => console.error('Failed to send notification:', err));

    res.status(201).json({
      status: 'success',
      message: 'Booking request submitted successfully. Please wait for admin approval.',
      data: {
        booking: {
          id: booking._id,
          gameType: booking.gameType,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          totalAmount: booking.totalAmount,
          status: booking.status,
          requestStatus: booking.requestStatus,
          playerName: booking.playerName
        }
      }
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking'
    });
  }
});

/**
 * @route   GET /api/booking/available-slots
 * @desc    Get available time slots for a date and game type
 * @access  Public
 */
router.get('/available-slots', async (req, res) => {
  try {
    const { gameType, date } = req.query;

    if (!gameType || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'Game type and date are required'
      });
    }

    if (!['pool', 'snooker'].includes(gameType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid game type'
      });
    }

    const queryDate = new Date(date);
    const dateStart = new Date(queryDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(queryDate);
    dateEnd.setHours(23, 59, 59, 999);

    // Get all bookings for this date and game type
    const bookings = await Booking.find({
      gameType,
      bookingDate: {
        $gte: dateStart,
        $lte: dateEnd
      },
      requestStatus: 'accepted', // Only check accepted bookings
      status: { $in: ['upcoming', 'ongoing'] }
    }).select('startTime endTime');

    // Generate all possible slots (11 AM to 11 PM)
    const startHour = parseInt(process.env.BOOKING_START_HOUR) || 11;
    const endHour = parseInt(process.env.BOOKING_END_HOUR) || 23;
    const allSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      allSlots.push(`${String(hour).padStart(2, '0')}:00`);
    }

    // Mark slots as booked
    const availableSlots = allSlots.map(slot => {
      const [slotHour, slotMin] = slot.split(':').map(Number);
      const slotMinutes = slotHour * 60 + slotMin;

      let isBooked = false;
      for (const booking of bookings) {
        const [startHour, startMin] = booking.startTime.split(':').map(Number);
        const [endHour, endMin] = booking.endTime.split(':').map(Number);
        const bookStart = startHour * 60 + startMin;
        const bookEnd = endHour * 60 + endMin;

        if (slotMinutes >= bookStart && slotMinutes < bookEnd) {
          isBooked = true;
          break;
        }
      }

      return {
        time: slot,
        available: !isBooked
      };
    });

    res.json({
      status: 'success',
      data: {
        date: queryDate,
        gameType,
        slots: availableSlots
      }
    });
  } catch (error) {
    console.error('Get Available Slots Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available slots'
    });
  }
});

/**
 * @route   GET /api/booking/my-bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user._id })
      .sort({ bookingDate: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({ user: req.user._id });

    // Apply dynamic status based on current time
    const bookingsWithStatus = applyDynamicStatusToMany(bookings);

    res.json({
      status: 'success',
      data: {
        bookings: bookingsWithStatus.map(b => ({
          id: b._id,
          gameType: b.gameType,
          playerName: b.playerName,
          bookingDate: b.bookingDate,
          startTime: b.startTime,
          endTime: b.endTime,
          duration: b.duration,
          totalAmount: b.totalAmount,
          requestStatus: b.requestStatus,
          status: b.status,
          createdAt: b.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

module.exports = router;
