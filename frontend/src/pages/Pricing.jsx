import React, { useState, useEffect, useCallback, useRef } from 'react';
import { pricingAPI } from '../utils/api';

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedData = useRef(false);

  const loadPricing = useCallback(async () => {
    // Prevent duplicate calls
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    try {
      const response = await pricingAPI.getAll();
      if (response.data.status === 'success') {
        setPricing(response.data.data.pricing);
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
      hasLoadedData.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const getPricingIcon = (gameType) => {
    return gameType === 'pool' ? '🎱' : '🎯';
  };

  const getPricingColor = (gameType) => {
    return gameType === 'pool' ? 'cyan' : 'pink';
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 py-8 sm:py-12 relative">
      {/* Background effects */}
      <div className="absolute top-40 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-60 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4">
            <span className="neon-text-cyan">Our</span>{' '}
            <span className="neon-text-pink">Pricing</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300">
            Affordable rates for premium gaming experience
          </p>
        </div>

        {loading ? (
          <div className="text-center text-xl sm:text-2xl text-neon-cyan">Loading pricing...</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {pricing.map((item, index) => (
              <div
                key={item._id || `pricing-${index}`}
                className={`gradient-border p-1 hover:scale-105 transition-transform duration-300`}
              >
                <div className="bg-dark-card rounded-[18px] p-6 sm:p-8 text-center">
                  <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">{getPricingIcon(item.gameType)}</div>
                  
                  <h2 className={`text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4 ${
                    item.gameType === 'pool' ? 'text-neon-cyan' : 'text-neon-pink'
                  }`}>
                    {item.gameType === 'pool' ? 'Pool Table' : 'Snooker Table'}
                  </h2>

                  <div className="mb-4 sm:mb-6">
                    <div className={`text-5xl sm:text-6xl font-heading font-black ${
                      item.gameType === 'pool' ? 'text-neon-cyan' : 'text-neon-pink'
                    }`}>
                      ₹{item.pricePerHour}
                    </div>
                    <div className="text-gray-400 text-base sm:text-lg mt-2">per hour</div>
                  </div>

                  <div className="space-y-2 text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className={item.gameType === 'pool' ? 'text-neon-cyan' : 'text-neon-pink'}>✓</span>
                      <span>Premium {item.gameType} table</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className={item.gameType === 'pool' ? 'text-neon-cyan' : 'text-neon-pink'}>✓</span>
                      <span>Professional equipment</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className={item.gameType === 'pool' ? 'text-neon-cyan' : 'text-neon-pink'}>✓</span>
                      <span>Match tracking included</span>
                    </div>
                  </div>

                  <a
                    href="/booking"
                    className={`inline-block w-full py-3 rounded-lg font-bold transition-all duration-300
                             ${item.gameType === 'pool' 
                               ? 'bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-neon-cyan' 
                               : 'bg-gradient-to-r from-neon-pink to-neon-purple hover:shadow-neon-pink'
                             } text-white hover:scale-105`}
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-10 sm:mt-12 lg:mt-16 max-w-3xl mx-auto">
          <div className="gradient-border p-1">
            <div className="bg-dark-card rounded-[18px] p-5 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-neon-purple mb-3 sm:mb-4">
                📋 Booking Information
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-neon-green">•</span>
                  <span>Minimum booking duration: 1 hour</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-green">•</span>
                  <span>Maximum booking duration: 4 hours per session</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-green">•</span>
                  <span>Advance booking available up to 7 days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-neon-green">•</span>
                  <span>Free cancellation up to 2 hours before booking time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
