import React, { useState, useEffect, useCallback, useRef } from 'react';
import { matchesAPI } from '../utils/api';

const Games = ({ user }) => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [ongoingMatches, setOngoingMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOngoing = useRef(false);
  const hasLoadedPast = useRef(false);

  const loadOngoingMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await matchesAPI.getOngoing();
      if (response.data.status === 'success') {
        setOngoingMatches(response.data.data.matches);
      }
    } catch (error) {
      console.error('Failed to load ongoing matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPastMatches = useCallback(async () => {
    // Prevent duplicate calls
    if (hasLoadedPast.current) return;
    hasLoadedPast.current = true;

    setLoading(true);
    try {
      const response = await matchesAPI.getPast();
      if (response.data.status === 'success') {
        setPastMatches(response.data.data.matches);
      }
    } catch (error) {
      console.error('Failed to load past matches:', error);
      hasLoadedPast.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedOngoing.current) {
      hasLoadedOngoing.current = true;
      loadOngoingMatches();
    }
  }, [loadOngoingMatches]);

  useEffect(() => {
    if (activeTab === 'past') {
      loadPastMatches();
    }
  }, [activeTab, loadPastMatches]);

  // Auto-refresh ongoing matches every 30 seconds
  useEffect(() => {
    if (activeTab === 'ongoing') {
      const interval = setInterval(loadOngoingMatches, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, loadOngoingMatches]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 py-8 sm:py-12 relative">
      {/* Background effects */}
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
            <span className="neon-text-cyan">Live</span>{' '}
            <span className="neon-text-pink">Matches</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300">
            Track ongoing games and view match history
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 sm:py-4 rounded-lg font-heading font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
              activeTab === 'ongoing'
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-neon-cyan'
                : 'border-2 border-dark-border text-gray-400 hover:border-neon-cyan'
            }`}
          >
            <span className="hidden sm:inline">🎮 Ongoing Matches</span>
            <span className="sm:hidden">🎮 Ongoing</span>
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 sm:py-4 rounded-lg font-heading font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-neon-pink'
                  : 'border-2 border-dark-border text-gray-400 hover:border-neon-pink'
              }`}
            >
              <span className="hidden sm:inline">📜 Past Matches</span>
              <span className="sm:hidden">📜 Past</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-xl sm:text-2xl text-neon-cyan">
            Loading matches...
          </div>
        ) : (
          <>
            {/* Ongoing Matches */}
            {activeTab === 'ongoing' && (
              <div className="space-y-3 sm:space-y-4">
                {ongoingMatches.length === 0 ? (
                  <div className="gradient-border p-1">
                    <div className="bg-dark-card rounded-[18px] p-8 sm:p-12 text-center">
                      <div className="text-5xl sm:text-6xl mb-4">😴</div>
                      <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-400 mb-2">
                        No Ongoing Matches
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500">
                        All tables are currently available. Book now!
                      </p>
                    </div>
                  </div>
                ) : (
                  ongoingMatches.map((match, index) => (
                    <div key={match._id || index} className="gradient-border p-1 hover:scale-[1.02] transition-transform">
                      <div className="bg-dark-card rounded-[18px] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl sm:text-4xl">
                            {match.gameType === 'pool' ? '🎱' : '🎯'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-neon-green/20 border border-neon-green text-neon-green text-xs sm:text-sm font-bold">
                            LIVE
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Player 1 */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-cyan-400">
                                {match.player1Name}
                              </h3>
                              <p className="text-xs text-gray-400">{match.gameType === 'pool' ? 'Pool' : 'Snooker'}</p>
                            </div>
                            <div className="text-2xl sm:text-3xl font-heading font-bold text-cyan-400">
                              {match.player1Points}
                            </div>
                          </div>
                          
                          {/* VS */}
                          <div className="text-center text-gray-500 font-bold">VS</div>
                          
                          {/* Player 2 */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-pink-400">
                                {match.player2Name}
                              </h3>
                              <p className="text-xs text-gray-400">{match.gameType === 'pool' ? 'Pool' : 'Snooker'}</p>
                            </div>
                            <div className="text-2xl sm:text-3xl font-heading font-bold text-pink-400">
                              {match.player2Points}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Past Matches */}
            {activeTab === 'past' && (
              <div className="space-y-3 sm:space-y-4">
                {pastMatches.length === 0 ? (
                  <div className="gradient-border p-1">
                    <div className="bg-dark-card rounded-[18px] p-8 sm:p-12 text-center">
                      <div className="text-5xl sm:text-6xl mb-4">📭</div>
                      <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-400 mb-2">
                        No Past Matches
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500">
                        Your match history will appear here
                      </p>
                    </div>
                  </div>
                ) : (
                  pastMatches.map((match, index) => (
                    <div key={match._id || index} className="gradient-border p-1">
                      <div className="bg-dark-card rounded-[18px] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl sm:text-4xl">
                            {match.gameType === 'pool' ? '🎱' : '🎯'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500 text-gray-400 text-xs sm:text-sm font-bold">
                            COMPLETED
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Player 1 */}
                          <div className={`flex items-center justify-between p-3 rounded-lg ${
                            match.winner === match.player1Name 
                              ? 'bg-green-500/20 border-2 border-green-500' 
                              : 'bg-cyan-500/10 border border-cyan-500/20'
                          }`}>
                            <div className="flex items-center gap-2">
                              {match.winner === match.player1Name && (
                                <span className="text-2xl">🏆</span>
                              )}
                              <div>
                                <h3 className={`text-base sm:text-lg font-bold ${
                                  match.winner === match.player1Name ? 'text-green-400' : 'text-cyan-400'
                                }`}>
                                  {match.player1Name}
                                </h3>
                                <p className="text-xs text-gray-400">{match.gameType === 'pool' ? 'Pool' : 'Snooker'}</p>
                              </div>
                            </div>
                            <div className={`text-2xl sm:text-3xl font-heading font-bold ${
                              match.winner === match.player1Name ? 'text-green-400' : 'text-cyan-400'
                            }`}>
                              {match.player1Points}
                            </div>
                          </div>
                          
                          {/* VS */}
                          <div className="text-center text-gray-500 font-bold">VS</div>
                          
                          {/* Player 2 */}
                          <div className={`flex items-center justify-between p-3 rounded-lg ${
                            match.winner === match.player2Name 
                              ? 'bg-green-500/20 border-2 border-green-500' 
                              : 'bg-pink-500/10 border border-pink-500/20'
                          }`}>
                            <div className="flex items-center gap-2">
                              {match.winner === match.player2Name && (
                                <span className="text-2xl">🏆</span>
                              )}
                              <div>
                                <h3 className={`text-base sm:text-lg font-bold ${
                                  match.winner === match.player2Name ? 'text-green-400' : 'text-pink-400'
                                }`}>
                                  {match.player2Name}
                                </h3>
                                <p className="text-xs text-gray-400">{match.gameType === 'pool' ? 'Pool' : 'Snooker'}</p>
                              </div>
                            </div>
                            <div className={`text-2xl sm:text-3xl font-heading font-bold ${
                              match.winner === match.player2Name ? 'text-green-400' : 'text-pink-400'
                            }`}>
                              {match.player2Points}
                            </div>
                          </div>
                          
                          {match.winner === 'Draw' && (
                            <div className="text-center text-yellow-400 font-bold text-sm">
                              🤝 IT'S A DRAW!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Games;
