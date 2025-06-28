import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Header from '../components/layout/Header';
import Dashboard from '../components/sections/Dashboard';
import ComplaintForm from '../components/ComplaintForm';
import DashboardMap from '../components/DashboardMap';
import Analytics from '../components/sections/Analytics';
import Profile from '../components/sections/Profile';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const MainApp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If authentication completes and user is null, they need to log in
    if (!loading && !user) {
      // User is not authenticated, stay on login page
      return;
    }

    // If authentication completes and we have a user, they're logged in
    if (!loading && user) {
      // Check if user is an admin and redirect to admin dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      
      // Successful authentication for non-admin users
      toast({
        title: "Authentication successful",
        description: `Welcome back, ${user.name}!`,
      });
    }
  }, [loading, user, navigate, toast]);

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
    const role = searchParams.get('role') || 'citizen';
    return (
      <LoginForm 
        onToggleMode={() => setIsRegister(!isRegister)} 
        isRegister={isRegister}
        role={role as 'citizen' | 'admin'}
      />
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'submit':
        return <ComplaintForm />;
      case 'map':
        return <DashboardMap />;
      case 'analytics':
        return <Analytics />;
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

      <Header activeSection={activeSection} onSectionChange={setActiveSection} />
      
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
