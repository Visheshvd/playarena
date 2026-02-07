import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import NotificationBanner from './components/NotificationBanner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Games from './pages/Games';
import Pricing from './pages/Pricing';
import Leaderboard from './pages/Leaderboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { authAPI } from './utils/api';

function AppContent({ user, handleLogout, handleLogin }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-dark-bg">
      {!isAdminRoute && <Navbar user={user} onLogout={handleLogout} />}
      {user && <NotificationBanner />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/booking" element={user ? <Booking /> : <Navigate to="/login" />} />
        <Route path="/games" element={<Games user={user} />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    console.log('CheckAuth: Token exists?', !!token);
    if (token) {
      try {
        console.log('CheckAuth: Calling getProfile...');
        const response = await authAPI.getProfile();
        console.log('CheckAuth: Response received', response.data);
        if (response.data.status === 'success') {
          setUser(response.data.data.user);
          console.log('CheckAuth: User set successfully', response.data.data.user);
        }
      } catch (error) {
        console.error('CheckAuth: Error occurred', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        // Remove token on any error to ensure clean state
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData, token) => {
    console.log('HandleLogin: Saving token and setting user', userData);
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const handleLogout = async () => {
    console.log('HandleLogout: Logging out user');
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="text-4xl font-heading neon-text-cyan">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent user={user} handleLogout={handleLogout} handleLogin={handleLogin} />
    </Router>
  );
}

export default App;
