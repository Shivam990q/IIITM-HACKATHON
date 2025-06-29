import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate, useSearchParams, useParams, Outlet, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Header from '../components/layout/Header';
import AdminHeader from '../components/layout/AdminHeader';
import Dashboard from '../components/sections/Dashboard';
import AdminDashboard from '../components/sections/AdminDashboard';
import ComplaintForm from '../components/ComplaintForm';
import DashboardMap from '../components/DashboardMap';
import Profile from '../components/sections/Profile';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MainAppProps {
  section?: string;
}

const MainApp: React.FC<MainAppProps> = ({ section }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [loginRole, setLoginRole] = useState<'citizen' | 'admin'>('citizen');
  const { toast } = useToast();
  
  // Use a ref to track if we've shown the login message
  const loginMessageShown = useRef(false);

  // Extract the active section from the URL path
  const getActiveSectionFromPath = () => {
    const path = location.pathname;
    
    if (path.includes('/app/admin')) {
      const adminPath = path.split('/').pop() || 'dashboard';
      return adminPath === 'dashboard' ? 'admin-dashboard' : 
             adminPath === 'complaints' ? 'complaint-management' :
             adminPath === 'users' ? 'user-management' :
             adminPath === 'settings' ? 'admin-settings' : 'admin-dashboard';
    } else {
      return path.split('/').pop() || 'dashboard';
    }
  };

  // Determine active section from URL
  const activeSection = section || getActiveSectionFromPath();

  useEffect(() => {
    // Get role from URL parameters
    const role = searchParams.get('role');
    if (role === 'admin' || role === 'citizen') {
      setLoginRole(role);
    }

    // If authentication completes and user is null, they need to log in
    if (!loading && !user) {
      // User is not authenticated, stay on login page
      loginMessageShown.current = false;
      return;
    }

    // If authentication completes and we have a user, they're logged in
    if (!loading && user) {
      // Only show the toast once when the user first logs in
      if (!loginMessageShown.current) {
        toast({
          title: "Authentication successful",
          description: `Welcome back, ${user.name}! Logged in as ${user.role === 'admin' ? 'Admin' : 'Citizen'}.`,
        });
        loginMessageShown.current = true;
      }
      
      // Redirect to the appropriate dashboard based on user role if on the root app path
      if (location.pathname === '/app') {
        if (user.role === 'admin') {
          navigate('/app/admin/dashboard', { replace: true });
        } else {
          navigate('/app/dashboard', { replace: true });
        }
      }
      
      // Clear role parameter from URL after successful login
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('role');
      if (newSearchParams.toString()) {
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [loading, user, navigate, toast, searchParams, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full border-4 border-blue-100"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-b-blue-600 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-blue-400 blur-md"></div>
          </div>
          <div className="mt-6 text-blue-600 font-medium animate-pulse">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm 
        onToggleMode={() => setIsRegister(!isRegister)} 
        isRegister={isRegister}
        loginRole={loginRole}
        onRoleChange={(role) => {
          setLoginRole(role);
          // Update URL parameter
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('role', role);
          navigate(`/app?${newSearchParams.toString()}`, { replace: true });
        }}
      />
    );
  }

  const renderSection = () => {
    console.log("Active section:", activeSection);
    // If user is admin, render admin-specific sections
    if (user?.role === 'admin') {
      switch (activeSection) {
        case 'admin-dashboard':
        case 'dashboard':
          return <AdminDashboard />;
        case 'complaint-management':
        case 'complaints':
          return <AdminDashboard />;
        case 'user-management':
        case 'users':
          return <AdminDashboard />;
        case 'admin-settings':
        case 'settings':
          return <Profile />;
        default:
          return <AdminDashboard />;
      }
    }
    
    // For citizens, render citizen-specific sections
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'submit':
        return <ComplaintForm />;
      case 'map':
        return <DashboardMap />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  // Define animation variants
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut" as const
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/80">
      {/* Dynamic background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Render different headers based on user role */}
      {user?.role === 'admin' ? (
        <AdminHeader activeSection={activeSection} />
      ) : (
        <Header activeSection={activeSection} />
      )}
      
      <main className="container mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainApp;
