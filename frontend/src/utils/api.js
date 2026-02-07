import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Use adminToken for admin routes, authToken for user routes
  if (config.url.includes('/admin')) {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth APIs
export const authAPI = {
  sendOTP: (mobile) => api.post('/auth/send-otp', { mobile }),
  verifyOTP: (mobile, otp, name) => api.post('/auth/verify-otp', { mobile, otp, name }),
  getProfile: () => api.get('/auth/me'),
  getStats: () => api.get('/auth/stats'),
  logout: () => api.post('/auth/logout')
};

// Pricing APIs
export const pricingAPI = {
  getAll: () => api.get('/pricing')
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/booking/create', data),
  getAvailableSlots: (gameType, date) => api.get(`/booking/available-slots?gameType=${gameType}&date=${date}`),
  getMyBookings: () => api.get('/booking/my-bookings')
};

// Matches APIs
export const matchesAPI = {
  getOngoing: () => api.get('/matches/ongoing'),
  getPast: () => api.get('/matches/past'),
  getMyHistory: () => api.get('/matches/my-history'),
  getRecords: () => api.get('/matches/records')
};

// Admin APIs
export const adminAPI = {
  login: (mobile, password) => api.post('/admin/login', { mobile, password }),
  getUsers: () => api.get('/admin/users'),
  getMatches: () => api.get('/admin/matches'),
  createMatch: (data) => api.post('/admin/match', data),
  updateMatch: (id, data) => api.patch(`/admin/match/${id}`, data),
  updateMatchPoints: (id, points) => api.patch(`/admin/match/${id}`, points),
  getBookings: () => api.get('/admin/bookings'),
  getBookingRequests: () => api.get('/admin/booking-requests'),
  createBooking: (data) => api.post('/admin/booking', data),
  updateBooking: (id, data) => api.patch(`/admin/booking/${id}`, data),
  deleteBooking: (id) => api.delete(`/admin/booking/${id}`),
  acceptBooking: (id) => api.patch(`/admin/booking/${id}/accept`),
  declineBooking: (id) => api.patch(`/admin/booking/${id}/decline`),
  getStats: () => api.get('/admin/stats'),
  updateUserStats: (id, stats) => api.patch(`/admin/user/${id}/stats`, stats),
  recalculateUserStats: (id) => api.post(`/admin/user/${id}/recalculate-stats`)
};

export default api;
