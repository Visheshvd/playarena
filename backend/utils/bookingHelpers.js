/**
 * Helper function to determine booking status dynamically based on current time
 * @param {Object} booking - The booking object with bookingDate, startTime, endTime
 * @returns {string} - 'upcoming', 'ongoing', 'completed', or original status if cancelled
 */
const determineBookingStatus = (booking) => {
  // If booking is cancelled, keep that status
  if (booking.status === 'cancelled') {
    return 'cancelled';
  }

  // If no end time, cannot determine ongoing/completed status
  if (!booking.endTime) {
    return booking.status || 'upcoming';
  }

  const now = new Date();
  
  // Create booking start and end date-time objects
  const bookingDate = new Date(booking.bookingDate);
  const [startHour, startMin] = booking.startTime.split(':').map(Number);
  const [endHour, endMin] = booking.endTime.split(':').map(Number);
  
  const bookingStart = new Date(bookingDate);
  bookingStart.setHours(startHour, startMin, 0, 0);
  
  const bookingEnd = new Date(bookingDate);
  bookingEnd.setHours(endHour, endMin, 0, 0);
  
  // Handle case where end time is past midnight (next day)
  if (bookingEnd <= bookingStart) {
    bookingEnd.setDate(bookingEnd.getDate() + 1);
  }
  
  // Determine status based on current time
  if (now < bookingStart) {
    return 'upcoming'; // Future booking
  } else if (now >= bookingStart && now <= bookingEnd) {
    return 'ongoing'; // Currently in progress
  } else {
    return 'completed'; // Past booking
  }
};

/**
 * Apply dynamic status to a booking object
 * @param {Object} booking - The booking object (can be a Mongoose document)
 * @returns {Object} - Booking object with updated status
 */
const applyDynamicStatus = (booking) => {
  const bookingObj = booking.toObject ? booking.toObject() : { ...booking };
  bookingObj.status = determineBookingStatus(booking);
  return bookingObj;
};

/**
 * Apply dynamic status to an array of bookings
 * @param {Array} bookings - Array of booking objects
 * @returns {Array} - Bookings with updated status
 */
const applyDynamicStatusToMany = (bookings) => {
  return bookings.map(booking => applyDynamicStatus(booking));
};

module.exports = {
  determineBookingStatus,
  applyDynamicStatus,
  applyDynamicStatusToMany
};
