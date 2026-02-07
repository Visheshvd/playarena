import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState(location.state?.mobile || '');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.sendOTP(mobile, true); // true = isLogin
      if (response.data.status === 'success') {
        setOtpSent(true);
        setSuccess('OTP sent successfully! Use: 1234');
      }
    } catch (err) {
      // Check if user not found
      if (err.response?.data?.code === 'USER_NOT_FOUND') {
        setError('Mobile number not registered. Redirecting to registration...');
        setTimeout(() => {
          navigate('/register', { state: { mobile } });
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyOTP(mobile, otp);
      if (response.data.status === 'success') {
        onLogin(response.data.data.user, response.data.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 sm:px-6 relative">
      {/* Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="gradient-border p-1">
          <div className="bg-dark-card rounded-[18px] p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
                <span className="neon-text-cyan">Login</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400">Welcome back to the arena</p>
            </div>

            {/* Form */}
            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP}>
              <div className="space-y-4">
                {/* Mobile Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={otpSent}
                    className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                             text-white focus:border-neon-cyan focus:outline-none transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 bg-dark-bg border-2 border-dark-border rounded-lg
                               text-white focus:border-neon-cyan focus:outline-none transition-colors"
                      placeholder="4-digit OTP"
                      maxLength={4}
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold transition-all duration-300
                           bg-gradient-to-r from-neon-cyan to-neon-purple text-white
                           hover:shadow-neon-cyan hover:scale-105
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Send OTP'}
                </button>

                {/* Change Number */}
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOTP('');
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full py-2 text-neon-cyan text-sm hover:underline"
                  >
                    Change Mobile Number
                  </button>
                )}
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-neon-cyan hover:underline font-medium">
                Register
              </Link>
            </div>

            {/* Demo Info */}
            <div className="mt-6 p-3 bg-neon-purple/10 border border-neon-purple rounded-lg text-sm text-gray-300">
              💡 <strong>Demo:</strong> Use any 10-digit number. OTP: <strong className="text-neon-purple">1234</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
