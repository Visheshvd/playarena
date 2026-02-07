import React, { useState, useEffect } from 'react';
import { bookingAPI, pricingAPI, authAPI } from '../utils/api';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [gameType, setGameType] = useState('pool');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasAutoFilledStart, setHasAutoFilledStart] = useState(false);

  useEffect(() => {
    loadPricing();
    loadUserProfile();
    setBookingDate(new Date().toISOString().split('T')[0]);
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.status === 'success') {
        const userName = response.data.data.user.name || '';
        setPlayerName(userName);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  // Auto-fill start time when entering step 2
  useEffect(() => {
    const getCurrentTime = () => {
      const now = new Date();
      return now.toTimeString().slice(0, 5); // Format: HH:MM
    };

    if (step === 2 && !hasAutoFilledStart) {
      if (!startTime) {
        setStartTime(getCurrentTime());
        setHasAutoFilledStart(true);
      }
    }
  }, [step, hasAutoFilledStart, startTime]);

  // Auto-fill end time when start time is set
  const handleStartTimeChange = (value) => {
    setStartTime(value);
    // If end time is empty and start time is being set, fill end time with current time
    if (value && !endTime) {
      const now = new Date();
      setEndTime(now.toTimeString().slice(0, 5));
    }
  };

  // Auto-calculate duration when both times are present
  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      let diffMinutes = endMinutes - startMinutes;
      
      // Handle next day case
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
      }
      
      const hours = (diffMinutes / 60).toFixed(1);
      setDuration(hours > 0 ? hours : '');
    } else {
      setDuration('');
    }
  }, [startTime, endTime]);

  const loadPricing = async () => {
    try {
      const response = await pricingAPI.getAll();
      if (response.data.status === 'success') {
        setPricing(response.data.data.pricing);
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
    }
  };

  const handleConfirmBooking = async () => {
    // Validate all required fields for customer booking
    if (!playerName) {
      setError('Please enter player name');
      return;
    }
    if (!bookingDate) {
      setError('Please select booking date');
      return;
    }
    if (!startTime) {
      setError('Please select start time');
      return;
    }
    if (!endTime) {
      setError('Please select end time');
      return;
    }
    if (!duration || parseFloat(duration) <= 0) {
      setError('Please ensure valid duration is calculated');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const bookingData = {
        gameType,
        bookingDate,
        startTime,
        endTime,
        duration: parseFloat(duration),
        playerName
      };
      
      // Calculate amount if duration is available
      if (duration) {
        bookingData.amount = getCurrentPrice() * parseFloat(duration);
      }

      const response = await bookingAPI.create(bookingData);

      if (response.data.status === 'success') {
        setSuccess('🎉 Booking request submitted! Waiting for admin approval.');
        setTimeout(() => {
          resetForm();
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setStartTime('');
    setEndTime('');
    setDuration('');
    setPlayerName('');
    setSuccess('');
    setError('');
    setHasAutoFilledStart(false);
  };

  const getCurrentPrice = () => {
    const priceItem = pricing.find(p => p.gameType === gameType);
    return priceItem ? priceItem.pricePerHour : (gameType === 'pool' ? 90 : 180);
  };

  const getPrice = (type) => {
    const priceItem = pricing.find(p => p.gameType === type);
    return priceItem ? priceItem.pricePerHour : (type === 'pool' ? 90 : 180);
  };

  const getTotalAmount = () => {
    if (!duration) return 0;
    return getCurrentPrice() * parseFloat(duration);
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 py-8 sm:py-12 relative">
      {/* Background effects */}
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="neon-text-cyan">Book</span>{' '}
            <span className="neon-text-pink">Your Table</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-300">
            Select your game, choose a time slot, and secure your booking
          </p>
        </div>

        <div className="gradient-border p-1">
          <div className="bg-dark-card rounded-[18px] p-4 sm:p-8">
            {/* Step 1: Game Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 text-neon-cyan">
                  Step 1: Select Game Type
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <button
                    onClick={() => setGameType('pool')}
                    className={`p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                      gameType === 'pool'
                        ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                        : 'border-dark-border hover:border-neon-cyan/50'
                    }`}
                  >
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎱</div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2">Pool Table</h3>
                    <p className="text-sm sm:text-base text-gray-400">₹{getPrice('pool')} per hour</p>
                  </button>

                  <button
                    onClick={() => setGameType('snooker')}
                    className={`p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
                      gameType === 'snooker'
                        ? 'border-neon-pink bg-neon-pink/10 shadow-neon-pink'
                        : 'border-dark-border hover:border-neon-pink/50'
                    }`}
                  >
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎯</div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2">Snooker Table</h3>
                    <p className="text-sm sm:text-base text-gray-400">₹{getPrice('snooker')} per hour</p>
                  </button>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                             text-white focus:border-neon-cyan focus:outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300
                           bg-gradient-to-r from-neon-cyan to-neon-purple text-white
                           hover:shadow-neon-cyan hover:scale-105"
                >
                  Next: Enter Details
                </button>
              </div>
            )}

            {/* Step 2: Time Slot & Details */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-6 text-neon-pink">
                  Step 2: Select Time & Details
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  {/* Booking Date & Start Time Combined */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Booking Date & Start Time <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                                 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                        required
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                                 text-white focus:border-neon-cyan focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Start time auto-fills with current time
                    </p>
                  </div>

                  {/* End Time with DateTime Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                               text-white focus:border-neon-cyan focus:outline-none transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-fills with current time when start time is set
                    </p>
                  </div>

                  {/* Duration (Auto-calculated or Manual) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (hours) <span className="text-red-400">*</span> <span className="text-gray-500 text-xs">(Auto-calculated)</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                               text-white focus:border-neon-cyan focus:outline-none transition-colors"
                      placeholder="Auto-calculated from times"
                      readOnly={startTime && endTime}
                      required
                    />
                    {startTime && endTime && duration && (
                      <p className="text-xs text-neon-cyan mt-1">
                        ✓ Auto-calculated: {duration} hours
                      </p>
                    )}
                  </div>

                  {/* Player Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Player Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                               text-white focus:border-neon-cyan focus:outline-none transition-colors"
                      placeholder="Enter player name"
                      required
                    />
                  </div>

                  {/* Total Amount Display */}
                  {duration && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-dark-bg rounded-xl border-2 border-neon-green">
                      <div className="flex justify-between items-center text-base sm:text-xl">
                        <span className="font-medium">Total Amount</span>
                        <span className="font-heading font-bold text-2xl sm:text-3xl text-neon-green">
                          ₹{getTotalAmount()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {getCurrentPrice()} × {duration} hours
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                      {success}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="w-full sm:flex-1 py-3 sm:py-4 rounded-lg font-bold border-2 border-dark-border
                               hover:border-gray-500 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={loading}
                      className="w-full sm:flex-1 py-3 sm:py-4 rounded-lg font-bold transition-all duration-300
                               bg-gradient-to-r from-neon-pink to-neon-purple text-white
                               hover:shadow-neon-pink hover:scale-105
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
