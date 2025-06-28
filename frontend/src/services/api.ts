import axios from 'axios';

// Create an axios instance with default config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    
    const { config, response } = error;
    const originalRequestUrl = config.url;

    // Handle token expiration or invalid token, but NOT for login attempts
    if (response?.status === 401 && !originalRequestUrl.includes('/login')) {
      console.log('Session expired or invalid. Logging out.');
      localStorage.removeItem('nyaychain_token');
      localStorage.removeItem('nyaychain_user');
      
      // Redirect to the home page, which will then handle routing to login
      window.location.href = '/';
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

// Add admin-specific services
export const adminService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      
      // Store token and user data in localStorage on success
      if (response.data.status === 'success') {
        localStorage.setItem('nyaychain_token', response.data.token);
        localStorage.setItem('nyaychain_user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Admin login API error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Admin login failed');
      }
      throw new Error('Network error during admin login');
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/stats/admin');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch admin statistics');
      }
      throw new Error('Network error while fetching admin statistics');
    }
  },
  
  getOfficials: async () => {
    try {
      const response = await api.get('/users/officials');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch officials');
      }
      throw new Error('Network error while fetching officials');
    }
  },
  
  createOfficial: async (officialData: any) => {
    try {
      const response = await api.post('/users/officials', officialData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to create official');
      }
      throw new Error('Network error while creating official');
    }
  },
  
  updateComplaintStatus: async (complaintId: string, status: string, comment: string) => {
    try {
      const response = await api.patch(`/complaints/${complaintId}/status`, { 
        status, 
        comment 
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update complaint status');
      }
      throw new Error('Network error while updating complaint status');
    }
  },
  
  assignComplaint: async (complaintId: string, officialId: string) => {
    try {
      const response = await api.patch(`/complaints/${complaintId}/assign`, { 
        officialId 
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to assign complaint');
      }
      throw new Error('Network error while assigning complaint');
    }
  }
};

export default api; 