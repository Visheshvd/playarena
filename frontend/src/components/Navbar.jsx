import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Debug: Log user state changes
  React.useEffect(() => {
    console.log('Navbar: User state changed', user ? { name: user.name, mobile: user.mobile } : 'null');
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="text-xl sm:text-2xl font-heading font-bold">
              <span className="neon-text-cyan">PLAY</span>
              <span className="neon-text-pink">ARENA</span>
            </div>
          </Link>

          {/* Center Menu - Desktop */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link to="/leaderboard" className="text-gray-300 hover:text-neon-cyan transition-colors duration-300 flex items-center gap-2 text-sm">
              <span>🏆</span> Leaderboard
            </Link>
            <Link to="/games" className="text-gray-300 hover:text-neon-cyan transition-colors duration-300 flex items-center gap-2 text-sm">
              <span>🎮</span> Games
            </Link>
            <Link to="/pricing" className="text-gray-300 hover:text-neon-cyan transition-colors duration-300 flex items-center gap-2 text-sm">
              <span>₹</span> Pricing
            </Link>
            {user && (
              <Link to="/booking" className="text-gray-300 hover:text-neon-cyan transition-colors duration-300 flex items-center gap-2 text-sm">
                <span>📅</span> Book
              </Link>
            )}
          </div>

          {/* Right Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm
                           bg-gradient-to-r from-neon-cyan to-neon-purple text-white
                           hover:shadow-neon-cyan hover:scale-105"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm
                           border-2 border-red-500 text-red-500
                           hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm
                           border-2 border-neon-cyan text-neon-cyan
                           hover:bg-neon-cyan hover:text-dark-bg hover:shadow-neon-cyan"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm
                           bg-gradient-to-r from-neon-cyan to-neon-purple text-white
                           hover:shadow-neon-purple hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-dark-border pt-4 space-y-3">
            <Link 
              to="/leaderboard" 
              className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
              onClick={closeMobileMenu}
            >
              🏆 Leaderboard
            </Link>
            <Link 
              to="/games" 
              className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
              onClick={closeMobileMenu}
            >
              🎮 Games
            </Link>
            <Link 
              to="/pricing" 
              className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
              onClick={closeMobileMenu}
            >
              ₹ Pricing
            </Link>
            {user && (
              <Link 
                to="/booking" 
                className="block px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                📅 Book Table
              </Link>
            )}
            
            <div className="pt-3 border-t border-dark-border space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block w-full px-4 py-3 rounded-lg font-medium text-center
                             bg-gradient-to-r from-neon-cyan to-neon-purple text-white"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 rounded-lg font-medium text-center
                             border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 rounded-lg font-medium text-center
                             border-2 border-neon-cyan text-neon-cyan"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-3 rounded-lg font-medium text-center
                             bg-gradient-to-r from-neon-cyan to-neon-purple text-white"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
