import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthContext';
import AdminLoginForm from '../../components/admin/AdminLoginForm';
import AdminDashboard from './AdminDashboard';
import ComplaintManagement from './ComplaintManagement';
import OfficialManagement from './OfficialManagement';
import AdminProfile from './AdminProfile';
import AdminAnalytics from './AdminAnalytics';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Check if user is admin
  const isAdmin = user && user.role === 'admin';
  
  return (
    <Routes>
      <Route path="login" element={!isAdmin ? <AdminLoginForm /> : <Navigate to="/admin/dashboard" replace />} />
      
      {/* Protected Admin Routes */}
      <Route 
        element={isAdmin ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="officials" element={<OfficialManagement />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes; 