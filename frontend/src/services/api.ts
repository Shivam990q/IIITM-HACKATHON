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
  register: async (name: string, email: string, password: string, role: 'citizen' | 'admin' = 'citizen') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
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
  login: async (email: string, password: string, role: 'citizen' | 'admin' = 'citizen') => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
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

  /**
   * Get user statistics
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user statistics' };
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

  /**
   * Get public live statistics (no authentication required)
   */
  getPublicLiveStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/public/live`);
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch live statistics' };
    }
  },
};

/**
 * Admin API endpoints
 */
export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch admin statistics' };
    }
  },

  /**
   * Get all users (admin view)
   */
  getAllUsers: async (filters?: { role?: string; page?: number; limit?: number }) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  /**
   * Get all complaints (admin view)
   */
  getAllComplaints: async (filters?: { status?: string; page?: number; limit?: number }) => {
    try {
      const response = await api.get('/admin/complaints', { params: filters });
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch complaints' };
    }
  },

  /**
   * Get complaint details (admin view)
   */
  getComplaintDetails: async (complaintId: string) => {
    try {
      const response = await api.get(`/admin/complaints/${complaintId}`);
      return response.data.data.complaint;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch complaint details' };
    }
  },

  /**
   * Assign complaint to official/department
   */
  assignComplaint: async (complaintId: string, data: { 
    officialId?: string; 
    department: string; 
    priority?: string; 
    note?: string; 
  }) => {
    try {
      const response = await api.patch(`/admin/complaints/${complaintId}/assign`, data);
      return response.data.data.complaint;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to assign complaint' };
    }
  },

  /**
   * Update complaint status
   */
  updateComplaintStatus: async (complaintId: string, data: { 
    status: string; 
    note?: string; 
  }) => {
    try {
      const response = await api.patch(`/admin/complaints/${complaintId}/status`, data);
      return response.data.data.complaint;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update complaint status' };
    }
  },

  /**
   * Update user role and permissions
   */
  updateUserRole: async (userId: string, data: { role: string; permissions?: string[] }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, data);
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update user role' };
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete user' };
    }
  },
};

/**
 * Category Services
 */
export const categoryService = {
  /**
   * Get all active categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  /**
   * Get all categories (including inactive) - Admin only
   */
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories/all');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to fetch all categories' };
    }
  },

  /**
   * Create a new category - Admin only
   */
  createCategory: async (categoryData: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
  }) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to create category' };
    }
  },

  /**
   * Update a category - Admin only
   */
  updateCategory: async (categoryId: string, categoryData: any) => {
    try {
      const response = await api.patch(`/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update category' };
    }
  },

  /**
   * Delete a category - Admin only
   */
  deleteCategory: async (categoryId: string) => {
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete category' };
    }
  },

  /**
   * Toggle category status - Admin only
   */
  toggleCategoryStatus: async (categoryId: string) => {
    try {
      const response = await api.patch(`/categories/${categoryId}/toggle`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to toggle category status' };
    }
  },

  /**
   * Reorder categories - Admin only
   */
  reorderCategories: async (categories: { id: string; order: number }[]) => {
    try {
      const response = await api.patch('/categories/reorder', { categories });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to reorder categories' };
    }
  },
};

export default api;