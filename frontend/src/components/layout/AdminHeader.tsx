import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  LogOut, 
  Home, 
  FileText, 
  Settings,
  Bell,
  Menu,
  Search,
  HelpCircle,
  Users,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface AdminHeaderProps {
  activeSection: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeSection }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchActive, setSearchActive] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);  const adminNavigationItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: Home, description: 'Admin Overview', path: '/app/admin/dashboard' },
    { id: 'complaint-management', label: 'Complaints', icon: FileText, description: 'Manage Complaints', path: '/app/admin/complaints' },
    { id: 'user-management', label: 'Users', icon: Users, description: 'User Management', path: '/app/admin/users' },
    { id: 'admin-settings', label: 'Settings', icon: Settings, description: 'System Settings', path: '/app/admin/settings' },
  ];

  const adminNotifications = [
    { title: "Urgent complaint received", desc: "Water supply issue in Sector 12", time: "5m ago", type: "urgent" },
    { title: "User verification pending", desc: "3 new user accounts need approval", time: "15m ago", type: "info" },
    { title: "Monthly report ready", desc: "December complaint resolution summary", time: "1h ago", type: "success" },
    { title: "System maintenance", desc: "Scheduled maintenance at 2 AM", time: "2h ago", type: "warning" },
  ];

  return (
    <header className="border-b bg-white/95 backdrop-blur-xl shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Enhanced interactive logo for Admin */}
          <motion.div 
            className="flex items-center space-x-4 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/app/admin/dashboard')}
          >
            <div className="relative group">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25"
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white"></span>
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                NyayChain Admin
              </h1>
              <p className="text-xs text-slate-500 font-medium">Administrative Panel</p>
            </div>
          </motion.div>

          {/* Search bar */}
          <div className={`hidden md:flex items-center transition-all duration-300 overflow-hidden ${searchActive ? 'w-64' : 'w-40'}`}>
            <div className="relative w-full">
              <Input 
                className={`pl-9 py-1 h-8 bg-slate-50 border-slate-200 focus:border-green-300 transition-all duration-300 ${searchActive ? 'pr-8' : ''}`}
                placeholder="Search complaints, users..." 
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-slate-400" />
              {searchActive && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 h-6 w-6 p-1 hover:bg-transparent"
                  onClick={() => setSearchActive(false)}
                >
                  <span className="sr-only">Close search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </Button>
              )}
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {adminNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <motion.div 
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => navigate(item.path)}
                    className={`relative flex items-center space-x-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-green-500/25' 
                        : 'hover:bg-green-50 hover:text-green-700'
                    }`}
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="adminActiveIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Admin User Menu */}
          <div className="flex items-center space-x-4">
            {/* Help button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-green-50 hover:text-green-700 transition-colors">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </motion.div>
            
            {/* Admin Notifications */}
            <div className="relative">
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="relative hover:bg-green-50 hover:text-green-700 transition-colors">
                      <Bell className="h-4 w-4" />
                      {adminNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                          {adminNotifications.length}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-xl">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Admin Notifications</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {adminNotifications.length} new
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {adminNotifications.map((notification, index) => (
                    <DropdownMenuItem key={index} className="py-3 focus:bg-green-50">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'urgent' ? 'bg-red-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs">{notification.desc}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs opacity-70">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center text-green-600 font-medium hover:text-green-700 hover:bg-green-50 cursor-pointer">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu for Admin */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {adminNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem 
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={activeSection === item.id ? 'bg-green-50 text-green-600' : ''}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-3 hover:bg-green-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="font-medium">{user?.name}</div>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/app/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
