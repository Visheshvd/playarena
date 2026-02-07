import React, { useState, useEffect, useCallback, useRef } from 'react';
import { matchesAPI } from '../utils/api';

const Leaderboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedData = useRef(false);

  const loadRecords = useCallback(async () => {
    // Prevent duplicate calls
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    try {
      const response = await matchesAPI.getRecords();
      if (response.data.status === 'success') {
        const recordsData = response.data.data.records;
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      }
    } catch (error) {
      console.error('Failed to load records:', error);
      setRecords([]);
      hasLoadedData.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 py-8 sm:py-12 relative">
      {/* Background effects */}
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
            <span className="neon-text-cyan">Leader</span>
            <span className="neon-text-pink">board</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300">
            Top players who dominate the arena
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xl sm:text-2xl text-neon-cyan">
            Loading leaderboard...
          </div>
        ) : records.length === 0 ? (
          <div className="gradient-border p-1">
            <div className="bg-dark-card rounded-[18px] p-8 sm:p-12 text-center">
              <div className="text-5xl sm:text-6xl mb-4">🏆</div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-400 mb-2">
                No Rankings Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                Be the first to play and claim the top spot!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Top 3 Podium */}
            {records.slice(0, 3).length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {records.slice(0, 3).map((record, index) => (
                  <div
                    key={record._id}
                    className={`gradient-border p-1 ${
                      index === 0 ? 'lg:col-start-2 lg:order-first sm:col-span-2 lg:col-span-1' : ''
                    }`}
                  >
                    <div className={`bg-dark-card rounded-[18px] p-4 sm:p-6 text-center ${
                      index === 0 ? 'lg:scale-110' : ''
                    }`}>
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">
                        {getRankIcon(index + 1)}
                      </div>
                      <h3 className={`text-xl sm:text-2xl font-heading font-bold mb-2 sm:mb-3 ${getRankColor(index + 1)}`}>
                        {record._id}
                      </h3>
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-gray-400">
                          <span className="text-2xl sm:text-3xl font-heading font-bold text-neon-cyan">
                            {record.totalPoints}
                          </span>
                          <div className="text-xs sm:text-sm">Total Points</div>
                        </div>
                        <div className="text-gray-400">
                          <span className="text-xl sm:text-2xl font-heading font-bold text-neon-green">
                            {record.totalWins}W
                          </span>
                          <span className="text-gray-500 mx-1">-</span>
                          <span className="text-xl sm:text-2xl font-heading font-bold text-red-400">
                            {record.totalLosses}L
                          </span>
                          <div className="text-xs sm:text-sm">Win-Loss</div>
                        </div>
                        <div className="text-gray-400">
                          <span className="text-xl sm:text-2xl font-heading font-bold text-neon-purple">
                            {record.highestBreak}
                          </span>
                          <div className="text-xs sm:text-sm">Highest Break</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest of the leaderboard */}
            {records.slice(3).map((record, index) => (
              <div key={record._id} className="gradient-border p-1 hover:scale-[1.02] transition-transform">
                <div className="bg-dark-card rounded-[18px] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                      <div className={`text-2xl sm:text-3xl font-heading font-bold w-12 sm:w-16 text-center ${getRankColor(index + 4)}`}>
                        #{index + 4}
                      </div>
                      <div className="text-3xl sm:text-4xl">👤</div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-white">
                          {record._id}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto justify-around sm:justify-end">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-neon-cyan">
                          {record.totalPoints}
                        </div>
                        <div className="text-xs text-gray-400">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-neon-green">
                          {record.totalWins}W
                        </div>
                        <div className="text-xs text-gray-400">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-red-400">
                          {record.totalLosses}L
                        </div>
                        <div className="text-xs text-gray-400">Losses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-neon-purple">
                          {record.highestBreak}
                        </div>
                        <div className="text-xs text-gray-400">High Break</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 sm:mt-12 gradient-border p-1">
          <div className="bg-dark-card rounded-[18px] p-5 sm:p-6 lg:p-8">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-neon-cyan mb-3 sm:mb-4">
              🏆 How Rankings Work
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-neon-green">•</span>
                <span>Rankings are based on total points earned</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-green">•</span>
                <span>Only top 10 players are displayed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-green">•</span>
                <span>Win matches to earn points and climb the leaderboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-green">•</span>
                <span>Leaderboard updates after each completed match</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
