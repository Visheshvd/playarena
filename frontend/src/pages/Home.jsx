import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo Card */}
          <div className="mb-8 sm:mb-12 inline-block float-animation">
            <div className="gradient-border p-1">
              <div className="bg-dark-card rounded-[18px] p-6 sm:p-8 lg:p-12">
                <svg 
                  className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto"
                  viewBox="0 0 100 100" 
                  fill="none"
                >
                  {/* Circuit-style logo design */}
                  <circle cx="50" cy="50" r="45" stroke="url(#gradient1)" strokeWidth="2" className="animate-pulse" />
                  <circle cx="50" cy="50" r="35" stroke="url(#gradient2)" strokeWidth="2" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                  <path d="M50 20 L50 35 M50 65 L50 80 M20 50 L35 50 M65 50 L80 50" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M35 35 L40 40 M60 40 L65 35 M35 65 L40 60 M60 60 L65 65" stroke="#ff00ff" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="8" fill="url(#gradient3)" className="animate-pulse" />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#ff00ff" />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff00ff" />
                      <stop offset="100%" stopColor="#00f0ff" />
                    </linearGradient>
                    <radialGradient id="gradient3">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#bf40bf" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black mb-4 sm:mb-6">
            <span className="neon-text-cyan">PLAY</span>
            <span className="neon-text-pink">ARENA</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
            Your Ultimate Gaming Destination — Track Your Snooker Games & Dominate the Arena
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
            <Link
              to="/register"
              className="group w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300
                       bg-gradient-to-r from-neon-cyan to-neon-purple text-white
                       hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105
                       flex items-center justify-center gap-3"
            >
              <span>🎮</span>
              <span>JOIN THE ARENA</span>
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300
                       border-2 border-neon-cyan text-neon-cyan bg-transparent
                       hover:bg-neon-cyan hover:text-dark-bg hover:shadow-neon-cyan"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-center mb-8 sm:mb-12 lg:mb-16">
            <span className="neon-text-cyan">Why Choose</span>{' '}
            <span className="neon-text-pink">PlayArena?</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="gradient-border p-1 group hover:scale-105 transition-transform duration-300">
              <div className="bg-dark-card rounded-[18px] p-5 sm:p-6 lg:p-8 h-full">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎱</div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold mb-3 sm:mb-4 text-neon-cyan">
                  Book Tables
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Easy online booking for pool and snooker tables. Check real-time availability and secure your slot instantly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="gradient-border p-1 group hover:scale-105 transition-transform duration-300">
              <div className="bg-dark-card rounded-[18px] p-5 sm:p-6 lg:p-8 h-full">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🏆</div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold mb-3 sm:mb-4 text-neon-pink">
                  Track Matches
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Monitor ongoing games and view your match history. Keep track of your gaming journey.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="gradient-border p-1 group hover:scale-105 transition-transform duration-300">
              <div className="bg-dark-card rounded-[18px] p-5 sm:p-6 lg:p-8 h-full">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📊</div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold mb-3 sm:mb-4 text-neon-purple">
                  Leaderboards
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Compete with other players and climb the rankings. See who dominates the arena.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
