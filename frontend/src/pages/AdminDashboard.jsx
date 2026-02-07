import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, pricingAPI } from '../utils/api';
import AdminInput from '../components/admin/AdminInput';
import AdminSelect from '../components/admin/AdminSelect';
import AdminButton from '../components/admin/AdminButton';
import AdminCard from '../components/admin/AdminCard';
import PlayerSearch from '../components/admin/PlayerSearch';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editingUserStats, setEditingUserStats] = useState(null);
  const navigate = useNavigate();

  // User Stats Form State
  const [userStatsForm, setUserStatsForm] = useState({
    totalPoints: 0,
    totalWins: 0,
    totalLosses: 0,
    highestBreak: 0
  });

  // Match Form State - Two players with IDs
  const [matchForm, setMatchForm] = useState({
    player1Id: '',
    player2Id: '',
    gameType: 'pool',
    status: 'ongoing',
    player1Points: '',
    player2Points: ''
  });

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    playerName: '',
    mobile: '',
    gameType: 'pool',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    duration: '',
    amount: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('AdminDashboard: Checking auth, token exists?', !!token);
    if (!token) {
      console.log('AdminDashboard: No token, redirecting to login');
      navigate('/admin/login');
      return;
    }
    console.log('AdminDashboard: Token found, loading stats...');
    loadStats();
    loadPricing();
    loadBookingRequests(); // Load requests on mount to show badge count
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'matches') {
      loadMatches();
      if (users.length === 0) loadUsers(); // Load users for player search
    }
    else if (activeTab === 'bookings') loadBookings();
    else if (activeTab === 'requests') loadBookingRequests();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      console.log('AdminDashboard: Calling getStats API...');
      const response = await adminAPI.getStats();
      console.log('AdminDashboard: Stats loaded successfully', response.data.data);
      setStats(response.data.data);
    } catch (err) {
      console.error('AdminDashboard: Failed to load stats', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('AdminDashboard: Auth error, removing token and redirecting');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        console.log('AdminDashboard: Non-auth error, keeping token');
      }
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getMatches();
      setMatches(response.data.data.matches);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      console.log('Loading bookings...');
      const response = await adminAPI.getBookings();
      console.log('Bookings response:', response.data);
      setBookings(response.data.data.bookings);
      console.log('Bookings set, count:', response.data.data.bookings.length);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingRequests = async () => {
    setLoading(true);
    try {
      console.log('Loading booking requests...');
      const response = await adminAPI.getBookingRequests();
      console.log('Booking requests response:', response.data);
      setBookingRequests(response.data.data.bookings);
      console.log('Booking requests set, count:', response.data.data.bookings.length);
    } catch (err) {
      console.error('Failed to load booking requests:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await adminAPI.acceptBooking(bookingId);
      loadBookingRequests();
      loadBookings();
      loadStats();
      alert('Booking accepted successfully!');
    } catch (err) {
      alert('Failed to accept booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to decline this booking?')) return;
    try {
      await adminAPI.declineBooking(bookingId);
      loadBookingRequests();
      loadBookings();
      loadStats();
      alert('Booking declined');
    } catch (err) {
      alert('Failed to decline booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateMatchPoints = async (matchId, player1Points, player2Points, status) => {
    try {
      const updateData = {};
      if (player1Points !== undefined) updateData.player1Points = player1Points;
      if (player2Points !== undefined) updateData.player2Points = player2Points;
      if (status !== undefined) updateData.status = status;
      
      await adminAPI.updateMatch(matchId, updateData);
      loadMatches();
      setEditingMatch(null);
      alert('Match updated successfully!');
    } catch (err) {
      alert('Failed to update match: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditUserStats = (user) => {
    setEditingUserStats(user);
    setUserStatsForm({
      totalPoints: user.stats?.totalPoints || 0,
      totalWins: user.stats?.totalWins || 0,
      totalLosses: user.stats?.totalLosses || 0,
      highestBreak: user.stats?.highestBreak || 0
    });
  };

  const handleUpdateUserStats = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateUserStats(editingUserStats._id, userStatsForm);
      setEditingUserStats(null);
      loadUsers();
      alert('User stats updated successfully!');
    } catch (err) {
      alert('Failed to update user stats: ' + (err.response?.data?.message || err.message));
    }
  };

  const loadPricing = async () => {
    try {
      const response = await pricingAPI.getAll();
      if (response.data.status === 'success') {
        setPricing(response.data.data.pricing);
      }
    } catch (err) {
      console.error('Failed to load pricing:', err);
    }
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!matchForm.player1Id || !matchForm.player2Id) {
        alert('Please select both players');
        return;
      }
      if (matchForm.player1Id === matchForm.player2Id) {
        alert('Please select two different players');
        return;
      }
      await adminAPI.createMatch(matchForm);
      setShowMatchForm(false);
      setMatchForm({
        player1Id: '',
        player2Id: '',
        gameType: 'pool',
        status: 'ongoing',
        player1Points: '',
        player2Points: ''
      });
      loadMatches();
      loadStats();
      alert('Match created successfully!');
    } catch (err) {
      alert('Failed to create match: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBooking) {
        // Update existing booking
        await adminAPI.updateBooking(editingBooking._id, bookingForm);
        setEditingBooking(null);
      } else {
        // Create new booking
        await adminAPI.createBooking(bookingForm);
      }
      setShowBookingForm(false);
      setBookingForm({
        playerName: '',
        mobile: '',
        gameType: 'pool',
        bookingDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        duration: '',
        amount: ''
      });
      loadBookings();
      loadStats();
    } catch (err) {
      alert('Failed to save booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setBookingForm({
      playerName: booking.playerName || '',
      mobile: booking.user?.mobile || '',
      gameType: booking.gameType,
      bookingDate: new Date(booking.bookingDate).toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime || '',
      duration: booking.duration || '',
      amount: booking.amountPaid || booking.totalAmount || ''
    });
    setShowBookingForm(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await adminAPI.deleteBooking(bookingId);
      loadBookings();
      loadStats();
    } catch (err) {
      alert('Failed to delete booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setShowBookingForm(false);
    setBookingForm({
      playerName: '',
      mobile: '',
      gameType: 'pool',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      duration: '',
      amount: ''
    });
  };

  // Auto-calculate duration when start/end time changes
  useEffect(() => {
    if (bookingForm.startTime && bookingForm.endTime) {
      const start = new Date(`2000-01-01T${bookingForm.startTime}`);
      const end = new Date(`2000-01-01T${bookingForm.endTime}`);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours > 0) {
        setBookingForm(prev => ({
          ...prev,
          duration: diffHours.toFixed(1)
        }));
      }
    }
  }, [bookingForm.startTime, bookingForm.endTime]);

  // Auto-calculate end time when start time + duration changes
  useEffect(() => {
    if (bookingForm.startTime && bookingForm.duration && !bookingForm.endTime) {
      const start = new Date(`2000-01-01T${bookingForm.startTime}`);
      const durationMs = parseFloat(bookingForm.duration) * 60 * 60 * 1000;
      const end = new Date(start.getTime() + durationMs);
      const endTime = end.toTimeString().slice(0, 5);
      
      setBookingForm(prev => ({
        ...prev,
        endTime: endTime
      }));
    }
  }, [bookingForm.startTime, bookingForm.duration]);

  // Auto-calculate amount when duration or gameType changes
  useEffect(() => {
    if (bookingForm.duration && pricing.length > 0) {
      const priceEntry = pricing.find(p => p.gameType === bookingForm.gameType);
      if (priceEntry) {
        const calculatedAmount = parseFloat(bookingForm.duration) * priceEntry.pricePerHour;
        setBookingForm(prev => ({
          ...prev,
          amount: calculatedAmount.toFixed(0)
        }));
      }
    }
  }, [bookingForm.duration, bookingForm.gameType, pricing]);

  const handleLogout = () => {
    console.log('AdminDashboard: Logging out, removing token');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold font-['Orbitron']">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              ADMIN PANEL
            </span>
          </h1>
          <AdminButton
            onClick={handleLogout}
            variant="danger"
          >
            Logout
          </AdminButton>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        {stats && (
          <>
            {/* All Time Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-colors">
                <div className="text-cyan-400 text-sm mb-2 font-medium">Total Users</div>
                <div className="text-4xl font-bold text-white">{stats.totalUsers}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-colors">
                <div className="text-purple-400 text-sm mb-2 font-medium">Total Matches</div>
                <div className="text-4xl font-bold text-white">{stats.totalMatches}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-pink-500/20 rounded-2xl p-6 hover:border-pink-400/40 transition-colors">
                <div className="text-pink-400 text-sm mb-2 font-medium">Total Bookings</div>
                <div className="text-4xl font-bold text-white">{stats.totalBookings}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-400/40 transition-colors">
                <div className="text-green-400 text-sm mb-2 font-medium">Total Revenue</div>
                <div className="text-4xl font-bold text-white">₹{stats.totalRevenue}</div>
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                : 'bg-black/40 text-gray-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                : 'bg-black/40 text-gray-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                : 'bg-black/40 text-gray-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            🎮 Matches
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                : 'bg-black/40 text-gray-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                : 'bg-black/40 text-gray-400 hover:text-white border border-cyan-500/20'
            }`}
          >
            🔔 Requests {bookingRequests.length > 0 && `(${bookingRequests.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 overflow-hidden">
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-cyan-400">Dashboard Overview</h2>
              
              {/* Today's Performance */}
              {stats && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-cyan-300 mb-5 flex items-center gap-2">
                    <span>📅</span> Today's Performance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-xl p-5 hover:border-orange-400/40 transition-colors">
                      <div className="text-orange-400 text-sm mb-2 font-medium">Today's Matches</div>
                      <div className="text-4xl font-bold text-white">{stats.todayMatches || 0}</div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm border border-blue-500/20 rounded-xl p-5 hover:border-blue-400/40 transition-colors">
                      <div className="text-blue-400 text-sm mb-2 font-medium">Today's Bookings</div>
                      <div className="text-4xl font-bold text-white">{stats.todayBookings || 0}</div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-400/40 transition-colors">
                      <div className="text-emerald-400 text-sm mb-2 font-medium">Today's Revenue</div>
                      <div className="text-4xl font-bold text-white">₹{stats.todayRevenue || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-400 text-center py-4">Select a tab to manage users, matches, or bookings.</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-cyan-400">All Users</h2>
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b border-cyan-500/20">
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Name</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Mobile</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Points</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Wins</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Losses</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Highest Break</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Joined</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-gray-800 hover:bg-cyan-500/5">
                          <td className="py-3 px-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{user.mobile}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-cyan-400">{user.stats?.totalPoints || 0}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-green-400">{user.stats?.totalWins || 0}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-red-400">{user.stats?.totalLosses || 0}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-purple-400">{user.stats?.highestBreak || 0}</td>
                          <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <AdminButton
                              onClick={() => handleEditUserStats(user)}
                              variant="primary"
                              size="sm"
                            >
                              ✏️ Edit Stats
                            </AdminButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No users found</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-cyan-400">Booking Requests</h2>
              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.map((booking, index) => (
                    <div key={booking._id || index} className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex flex-wrap gap-4 justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{booking.user?.name || booking.playerName || 'N/A'}</h3>
                          <p className="text-sm text-gray-400">
                            {booking.user?.mobile || 'No mobile'} • {booking.gameType.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <AdminButton
                            onClick={() => handleAcceptBooking(booking._id)}
                            variant="success"
                            size="sm"
                          >
                            ✓ Accept
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDeclineBooking(booking._id)}
                            variant="danger"
                            size="sm"
                          >
                            ✗ Decline
                          </AdminButton>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="text-white">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <p className="text-white">{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="text-white">{booking.duration}h</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="text-green-400">₹{booking.totalAmount}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                          booking.status === 'ongoing' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">
                          PENDING APPROVAL
                        </span>
                      </div>
                    </div>
                  ))}
                  {bookingRequests.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No pending requests</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'matches' && (
            <div>
              <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-cyan-400">Match Records</h2>
                <AdminButton
                  onClick={() => setShowMatchForm(!showMatchForm)}
                  variant={showMatchForm ? 'secondary' : 'primary'}
                >
                  {showMatchForm ? 'Cancel' : '+ Add Match'}
                </AdminButton>
              </div>

              {showMatchForm && (
                <div className="mb-8 p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-400 mb-6">Start New Match</h3>
                  <form onSubmit={handleMatchSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PlayerSearch
                        label="Player 1"
                        value={{ players: users, selectedId: matchForm.player1Id }}
                        onChange={(player) => setMatchForm({...matchForm, player1Id: player?._id || ''})}
                        placeholder="Search for player 1..."
                        required
                        exclude={matchForm.player2Id}
                      />
                      <PlayerSearch
                        label="Player 2"
                        value={{ players: users, selectedId: matchForm.player2Id }}
                        onChange={(player) => setMatchForm({...matchForm, player2Id: player?._id || ''})}
                        placeholder="Search for player 2..."
                        required
                        exclude={matchForm.player1Id}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AdminSelect
                        label="Table Type"
                        value={matchForm.gameType}
                        onChange={(e) => setMatchForm({...matchForm, gameType: e.target.value})}
                        options={[
                          { value: 'pool', label: 'Pool' },
                          { value: 'snooker', label: 'Snooker' }
                        ]}
                        required
                      />
                      <AdminSelect
                        label="Match Status"
                        value={matchForm.status}
                        onChange={(e) => setMatchForm({...matchForm, status: e.target.value})}
                        options={[
                          { value: 'ongoing', label: 'Ongoing (Live)' },
                          { value: 'completed', label: 'Completed' }
                        ]}
                        required
                      />
                    </div>

                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                      <p className="text-sm text-gray-400 mb-3">
                        <span className="text-cyan-400 font-semibold">Optional:</span> Add points now or update them later
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdminInput
                          label="Player 1 Points"
                          type="number"
                          value={matchForm.player1Points}
                          onChange={(e) => setMatchForm({...matchForm, player1Points: e.target.value})}
                          placeholder="0"
                        />
                        <AdminInput
                          label="Player 2 Points"
                          type="number"
                          value={matchForm.player2Points}
                          onChange={(e) => setMatchForm({...matchForm, player2Points: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <AdminButton
                      type="submit"
                      variant="success"
                      fullWidth
                    >
                      {matchForm.status === 'ongoing' ? 'Start Match' : 'Create Match Record'}
                    </AdminButton>
                  </form>
                </div>
              )}

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b border-cyan-500/20">
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[200px]">Match</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[80px]">Table</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[100px]">Status</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[100px]">Date</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[100px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match) => (
                        <tr key={match._id} className="border-b border-gray-800 hover:bg-cyan-500/5">
                          <td className="py-3 px-4">
                            {match.player1Name && match.player2Name ? (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-cyan-400">{match.player1Name}</span>
                                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">{match.player1Points || 0}</span>
                                </div>
                                <span className="text-gray-500 text-sm">vs</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-pink-400">{match.player2Name}</span>
                                  <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded">{match.player2Points || 0}</span>
                                </div>
                              </div>
                            ) : (
                              <div>{match.playerName || match.user?.name || 'N/A'}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${
                              match.gameType === 'pool' 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {match.gameType?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${
                              match.status === 'ongoing'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {match.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                            {new Date(match.matchDate || match.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {match.player1Name && match.player2Name && (
                              <AdminButton
                                onClick={() => setEditingMatch(match)}
                                variant="secondary"
                                size="sm"
                              >
                                {match.status === 'ongoing' ? 'Update & Complete' : 'Edit'}
                              </AdminButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Edit Match Modal */}
                  {editingMatch && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                      <div className="bg-[#0b0f14] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">Update Match</h3>
                        <div className="space-y-4">
                          <AdminInput
                            label={`${editingMatch.player1Name} Points`}
                            type="number"
                            defaultValue={editingMatch.player1Points || 0}
                            id="player1PointsEdit"
                          />
                          <AdminInput
                            label={`${editingMatch.player2Name} Points`}
                            type="number"
                            defaultValue={editingMatch.player2Points || 0}
                            id="player2PointsEdit"
                          />
                          <AdminSelect
                            label="Match Status"
                            defaultValue={editingMatch.status}
                            id="matchStatusEdit"
                            options={[
                              { value: 'ongoing', label: 'Ongoing (Live)' },
                              { value: 'completed', label: 'Completed' }
                            ]}
                          />
                          <div className="flex gap-3">
                            <AdminButton
                              onClick={() => {
                                const p1 = document.getElementById('player1PointsEdit').value;
                                const p2 = document.getElementById('player2PointsEdit').value;
                                const status = document.getElementById('matchStatusEdit').value;
                                handleUpdateMatchPoints(editingMatch._id, p1, p2, status);
                              }}
                              variant="success"
                              fullWidth
                            >
                              Save Changes
                            </AdminButton>
                            <AdminButton
                              onClick={() => setEditingMatch(null)}
                              variant="secondary"
                              fullWidth
                            >
                              Cancel
                            </AdminButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {matches.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No matches found</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-cyan-400">Booking Records</h2>
                <AdminButton
                  onClick={() => {
                    if (showBookingForm && !editingBooking) {
                      handleCancelEdit();
                    } else if (!showBookingForm) {
                      setShowBookingForm(true);
                    }
                  }}
                  variant={showBookingForm && !editingBooking ? 'secondary' : 'primary'}
                >
                  {showBookingForm && !editingBooking ? 'Cancel' : '+ Add Booking'}
                </AdminButton>
              </div>

              {showBookingForm && (
                <div className="mb-8 p-6 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                  <h3 className="text-lg font-semibold text-purple-400 mb-6">
                    {editingBooking ? 'Edit Booking Record' : 'Create New Booking Record'}
                  </h3>
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AdminInput
                        label="Player Name"
                        type="text"
                        value={bookingForm.playerName}
                        onChange={(e) => setBookingForm({...bookingForm, playerName: e.target.value})}
                        placeholder="Enter player name"
                        required
                      />
                      <AdminInput
                        label="Mobile"
                        type="text"
                        value={bookingForm.mobile}
                        onChange={(e) => setBookingForm({...bookingForm, mobile: e.target.value})}
                        placeholder="Optional"
                      />
                      <AdminSelect
                        label="Game Type"
                        value={bookingForm.gameType}
                        onChange={(e) => setBookingForm({...bookingForm, gameType: e.target.value})}
                        options={[
                          { value: 'pool', label: 'Pool' },
                          { value: 'snooker', label: 'Snooker' }
                        ]}
                        required
                      />
                      <AdminInput
                        label="Booking Date"
                        type="date"
                        value={bookingForm.bookingDate}
                        onChange={(e) => setBookingForm({...bookingForm, bookingDate: e.target.value})}
                        required
                      />
                      <AdminInput
                        label="Start Time"
                        type="time"
                        value={bookingForm.startTime}
                        onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                        required
                      />
                      <AdminInput
                        label="End Time"
                        type="time"
                        value={bookingForm.endTime}
                        onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                        placeholder="Auto-calculated from start + duration"
                      />
                      <AdminInput
                        label="Duration (hours)"
                        type="number"
                        step="0.5"
                        value={bookingForm.duration}
                        onChange={(e) => setBookingForm({...bookingForm, duration: e.target.value})}
                        placeholder="Auto-calculated"
                      />
                      <AdminInput
                        label="Amount (₹)"
                        type="number"
                        value={bookingForm.amount}
                        onChange={(e) => setBookingForm({...bookingForm, amount: e.target.value})}
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="flex gap-3">
                      <AdminButton
                        type="submit"
                        variant="success"
                        fullWidth
                      >
                        {editingBooking ? 'Update Booking' : 'Create Booking Record'}
                      </AdminButton>
                      {editingBooking && (
                        <AdminButton
                          type="button"
                          variant="secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </AdminButton>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No bookings found. Create a booking using the form above.</p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="border-b border-cyan-500/20">
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[120px]">Player</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[110px]">Mobile</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[80px]">Game</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[100px]">Date</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[130px]">Time</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[80px]">Duration</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[80px]">Amount</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[100px]">Request</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[100px]">Booking</th>
                        <th className="text-left py-3 px-4 text-cyan-400 whitespace-nowrap min-w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr key={booking._id || index} className="border-b border-gray-800 hover:bg-cyan-500/5">
                          <td className="py-3 px-4 whitespace-nowrap">{booking.user?.name || booking.playerName || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{booking.user?.mobile || 'N/A'}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.gameType === 'pool' 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {booking.gameType?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm">
                            {booking.startTime} {booking.endTime ? `- ${booking.endTime}` : '(pending)'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {booking.duration ? `${booking.duration}h` : '-'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {booking.amountPaid || booking.totalAmount ? `₹${booking.amountPaid || booking.totalAmount}` : '-'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.requestStatus === 'pending' 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : booking.requestStatus === 'accepted'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {booking.requestStatus?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.status === 'upcoming'
                                ? 'bg-pink-500/20 text-pink-400'
                                : booking.status === 'ongoing'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : booking.status === 'completed'
                                ? 'bg-gray-500/20 text-gray-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {booking.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="px-3 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(booking._id)}
                                className="px-3 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No bookings found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit User Stats Modal */}
      {editingUserStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0f14] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-cyan-400 mb-6">
              Edit Stats - {editingUserStats.name}
            </h3>
            <form onSubmit={handleUpdateUserStats} className="space-y-4">
              <AdminInput
                label="Total Points"
                type="number"
                value={userStatsForm.totalPoints}
                onChange={(e) => setUserStatsForm({...userStatsForm, totalPoints: e.target.value})}
                required
              />
              <AdminInput
                label="Total Wins"
                type="number"
                value={userStatsForm.totalWins}
                onChange={(e) => setUserStatsForm({...userStatsForm, totalWins: e.target.value})}
                required
              />
              <AdminInput
                label="Total Losses"
                type="number"
                value={userStatsForm.totalLosses}
                onChange={(e) => setUserStatsForm({...userStatsForm, totalLosses: e.target.value})}
                required
              />
              <AdminInput
                label="Highest Break"
                type="number"
                value={userStatsForm.highestBreak}
                onChange={(e) => setUserStatsForm({...userStatsForm, highestBreak: e.target.value})}
                required
              />
              <div className="flex gap-3 mt-6">
                <AdminButton type="submit" variant="primary" className="flex-1">
                  Update Stats
                </AdminButton>
                <AdminButton
                  type="button"
                  onClick={() => setEditingUserStats(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
