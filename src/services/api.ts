import axios from 'axios';

// Create an axios instance with default config
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nyaychain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle token expiration or invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem('nyaychain_token');
      localStorage.removeItem('nyaychain_user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication Services
 */
export const authService = {  
  /**
   * Register a new user
   */
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.status === 'success') {
        localStorage.setItem('nyaychain_token', response.data.token);
        localStorage.setItem('nyaychain_user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      throw error.response?.data || { message: 'Registration failed' };
    }
  },
  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.status === 'success') {
        localStorage.setItem('nyaychain_token', response.data.token);
        localStorage.setItem('nyaychain_user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('nyaychain_token');
    localStorage.removeItem('nyaychain_user');
  },
};

/**
 * Complaint Services
 */
export const complaintService = {
  /**
   * Submit a new complaint
   */
  createComplaint: async (formData: FormData) => {
    try {
      const response = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit complaint' };
    }
  },

  /**
   * Get all complaints with filters
   */
  getComplaints: async (queryParams = {}) => {
    try {
      const response = await api.get('/complaints', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch complaints' };
    }
  },

  /**
   * Get a specific complaint by id
   */
  getComplaint: async (id: string) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response.data.data.complaint;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch complaint' };
    }
  },

  /**
   * Update a complaint status
   */
  updateStatus: async (id: string, status: string, note?: string) => {
    try {
      const response = await api.patch(`/complaints/${id}/status`, { status, note });
      return response.data.data.complaint;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update status' };
    }
  },

  /**
   * Add comment to a complaint
   */
  addComment: async (id: string, text: string) => {
    try {
      const response = await api.post(`/complaints/${id}/comments`, { text });
      return response.data.data.complaint;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add comment' };
    }
  },

  /**
   * Upvote a complaint
   */
  upvoteComplaint: async (id: string) => {
    try {
      const response = await api.post(`/complaints/${id}/upvote`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upvote' };
    }
  },
};

/**
 * User Services
 */
export const userService = {
  /**
   * Update user profile
   */
  updateProfile: async (userData: FormData) => {
    try {
      const response = await api.patch('/users/profile', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.user;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  /**
   * Get user's complaints
   */
  getUserComplaints: async (queryParams = {}) => {
    try {
      const response = await api.get('/users/complaints', { params: queryParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user complaints' };
    }
  },

  /**
   * Change user password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.patch('/users/password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },
};

/**
 * Stats Services
 */
export const statsService = {
  /**
   * Get summary statistics
   */
  getSummary: async () => {
    try {
      const response = await api.get('/stats/summary');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },

  /**
   * Get statistics by category
   */
  getStatsByCategory: async () => {
    try {
      const response = await api.get('/stats/by-category');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch category statistics' };
    }
  },

  /**
   * Get time series data for charts
   */
  getTimeSeriesData: async () => {
    try {
      const response = await api.get('/stats/time-series');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch time series data' };
    }
  },

  /**
   * Get map data for visualization
   */
  getMapData: async (bounds?: string) => {
    try {
      const params = bounds ? { bounds } : {};
      const response = await api.get('/stats/map-data', { params });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch map data' };
    }
  },
};

export default api; 