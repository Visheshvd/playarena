import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { matchesAPI, bookingAPI, authAPI } from '../utils/api';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWins: 0,
    totalLosses: 0,
    totalPoints: 0,
    highestBreak: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedData = useRef(false);

  const loadDashboardData = useCallback(async () => {
    // Prevent duplicate calls
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    try {
      // Load stats from API
      const statsResponse = await authAPI.getStats();
      if (statsResponse.data.status === 'success') {
        setStats(statsResponse.data.data.stats);
      }

      // Load bookings
      const bookingsResponse = await bookingAPI.getMyBookings();
      if (bookingsResponse.data.status === 'success') {
        setRecentBookings(bookingsResponse.data.data.bookings.slice(0, 3));
      }

      // Load match history
      const matchesResponse = await matchesAPI.getMyHistory();
      if (matchesResponse.data.status === 'success') {
        setGameHistory(matchesResponse.data.data.matches.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      hasLoadedData.current = false; // Reset on error to allow retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, loadDashboardData, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 py-8 sm:py-12 relative">
      {/* Background effects */}
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-2">
            <span className="neon-text-cyan">Welcome Back,</span>{' '}
            <span className="neon-text-pink">{user?.name || 'Player'}!</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400">Ready to dominate the arena today?</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {/* Total Wins */}
          <div className="gradient-border p-1 hover:scale-105 transition-transform duration-300">
            <div className="bg-dark-card rounded-[18px] p-6 text-center">
              <div className="text-5xl mb-3">🏆</div>
              <div className="text-4xl font-heading font-bold text-neon-cyan mb-2 neon-text-cyan">
                {stats.totalWins}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total Wins</div>
            </div>
          </div>

          {/* Total Losses */}
          <div className="gradient-border p-1 hover:scale-105 transition-transform duration-300">
            <div className="bg-dark-card rounded-[18px] p-6 text-center">
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-4xl font-heading font-bold text-neon-pink mb-2 neon-text-pink">
                {stats.totalLosses}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total Losses</div>
            </div>
          </div>

          {/* Total Points */}
          <div className="gradient-border p-1 hover:scale-105 transition-transform duration-300">
            <div className="bg-dark-card rounded-[18px] p-6 text-center">
              <div className="text-5xl mb-3">📈</div>
              <div className="text-4xl font-heading font-bold text-neon-cyan mb-2 neon-text-cyan">
                {stats.totalPoints}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Total Points</div>
            </div>
          </div>

          {/* Highest Break */}
          <div className="gradient-border p-1 hover:scale-105 transition-transform duration-300">
            <div className="bg-dark-card rounded-[18px] p-6 text-center">
              <div className="text-5xl mb-3">⭐</div>
              <div className="text-4xl font-heading font-bold text-neon-pink mb-2 neon-text-pink">
                {stats.highestBreak}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Highest Break</div>
            </div>
          </div>
        </div>

        {/* Action Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Live Matches */}
          <Link
            to="/games"
            className="gradient-border p-1 hover:scale-105 transition-all duration-300 group"
          >
            <div className="bg-dark-card rounded-[18px] p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">▶️</div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2 text-neon-cyan">Live Matches</h3>
              <p className="text-sm sm:text-base text-gray-400">View ongoing games</p>
            </div>
          </Link>

          {/* Book Table */}
          <Link
            to="/booking"
            className="gradient-border p-1 hover:scale-105 transition-all duration-300 group"
          >
            <div className="bg-dark-card rounded-[18px] p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2 text-neon-pink">Book Table</h3>
              <p className="text-sm sm:text-base text-gray-400">Reserve your spot</p>
            </div>
          </Link>

          {/* Leaderboard */}
          <Link
            to="/leaderboard"
            className="gradient-border p-1 hover:scale-105 transition-all duration-300 group"
          >
            <div className="bg-dark-card rounded-[18px] p-6 sm:p-8 text-center">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">🏆</div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold mb-2 text-neon-cyan">Leaderboard</h3>
              <p className="text-sm sm:text-base text-gray-400">See top players</p>
            </div>
          </Link>
        </div>

        {/* Bottom Section - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Game History */}
          <div className="gradient-border p-1">
            <div className="bg-dark-card rounded-[18px] p-5 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl">🎯</span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-neon-cyan uppercase tracking-wide">
                  Game History
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : gameHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-5xl sm:text-6xl mb-4 opacity-50">🎮</div>
                  <p className="text-gray-500 text-base sm:text-lg">No games yet. Start playing!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gameHistory.map((match, index) => (
                    <div
                      key={match._id || `match-${index}`}
                      className={`bg-dark-bg rounded-lg p-4 border-l-4 hover:bg-dark-bg/50 transition-colors ${
                        match.result === 'won' ? 'border-green-500' : match.result === 'lost' ? 'border-red-500' : 'border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{match.gameType === 'pool' ? '🎱' : '🎯'}</span>
                          <div>
                            <div className="font-bold text-white text-sm">
                              vs {match.opponent}
                            </div>
                            <div className="text-xs text-gray-400">
                              {match.gameType.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          match.result === 'won' 
                            ? 'bg-green-500/20 border border-green-500 text-green-400' 
                            : match.result === 'lost'
                            ? 'bg-red-500/20 border border-red-500 text-red-400'
                            : 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                        }`}>
                          {match.result === 'won' ? '🏆 WON' : match.result === 'lost' ? '❌ LOST' : '🤝 DRAW'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-gray-400">
                          {formatDate(match.matchDate)}
                        </div>
                        <div className="text-gray-500">
                          Score: {match.userPoints} - {match.opponentPoints}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="gradient-border p-1">
            <div className="bg-dark-card rounded-[18px] p-5 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl">📅</span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-neon-pink uppercase tracking-wide">
                  Recent Bookings
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-5xl sm:text-6xl mb-4 opacity-50">📆</div>
                  <p className="text-gray-500 text-base sm:text-lg">No bookings yet. Make one now!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div
                      key={booking._id || `booking-${index}`}
                      className="gradient-border p-1"
                    >
                      <div className="bg-dark-bg rounded-[16px] p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {booking.gameType === 'pool' ? '🎱 Pool' : '🎯 Snooker'} Table
                            </h3>
                            <p className="text-sm text-gray-400">
                              {formatDate(booking.bookingDate)} at {formatTime(booking.startTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-neon-green">₹{booking.amountPaid}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">Duration: {booking.duration}h</div>
                          <div className="flex gap-2">
                            {/* Request Status Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              booking.requestStatus === 'accepted' 
                                ? 'bg-green-500/20 border border-green-500 text-green-400'
                                : booking.requestStatus === 'declined'
                                ? 'bg-red-500/20 border border-red-500 text-red-400'
                                : 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                            }`}>
                              {booking.requestStatus ? booking.requestStatus.toUpperCase() : 'PENDING'}
                            </div>
                            {/* Booking Status Badge (only for accepted) */}
                            {booking.requestStatus === 'accepted' && (
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                booking.status === 'completed'
                                  ? 'bg-gray-500/20 border border-gray-500 text-gray-400'
                                  : booking.status === 'ongoing'
                                  ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan'
                                  : 'bg-neon-pink/20 border border-neon-pink text-neon-pink'
                              }`}>
                                {booking.status.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
