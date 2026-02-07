import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import AdminInput from '../components/admin/AdminInput';
import AdminButton from '../components/admin/AdminButton';

function AdminLogin() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('AdminLogin: Attempting login...');
      const response = await adminAPI.login(mobile, password);
      console.log('AdminLogin: Login successful, saving token');
      localStorage.setItem('adminToken', response.data.data.token);
      console.log('AdminLogin: Navigating to dashboard');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('AdminLogin: Login failed', err.response?.data);
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 font-['Orbitron']">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              ADMIN
            </span>
          </h1>
          <p className="text-gray-400 text-sm">Administration Panel</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <AdminInput
              label="Mobile Number"
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter admin mobile"
              required
            />

            <AdminInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <AdminButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </AdminButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              <span className="block mb-1 text-gray-500">Demo Credentials:</span>
              <span className="text-purple-400 font-mono">0000000000</span>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-purple-400 font-mono">admin123</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            ← Back to PlayArena
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
