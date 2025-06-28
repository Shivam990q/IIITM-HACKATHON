import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  LogOut, 
  Home, 
  FileText, 
  MapPin, 
  BarChart3,
  Settings,
  Bell,
  Menu,
  Search,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
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

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  const [searchActive, setSearchActive] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & Stats' },
    { id: 'submit', label: 'Submit Issue', icon: FileText, description: 'Report Problem' },
    { id: 'map', label: 'Public Map', icon: MapPin, description: 'Community View' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Insights' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
  ];

  const recentNotifications = [
    { title: "New resolution update", desc: "Your complaint #NYC002 has been resolved", time: "10m ago", type: "success" },
    { title: "Status change", desc: "Complaint #NYC003 changed to 'In Progress'", time: "1h ago", type: "update" },
    { title: "Comment received", desc: "Municipal officer added a comment to your issue", time: "3h ago", type: "alert" },
  ];

  const getNotificationStyle = (type: string) => {
    switch(type) {
      case "success": return "bg-green-100 text-green-700 border-green-300";
      case "update": return "bg-blue-100 text-blue-700 border-blue-300";
      case "alert": return "bg-amber-100 text-amber-700 border-amber-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-md shadow-blue-500/5">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Enhanced interactive logo */}
          <motion.div 
            className="flex items-center space-x-4 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            onClick={() => onSectionChange('dashboard')}
          >
            <div className="relative group">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                NyayChain
              </h1>
              <p className="text-xs text-slate-500 font-medium">Blockchain Governance</p>
            </div>
          </motion.div>

          {/* Search bar - expands on click */}
          <div className={`hidden md:flex items-center transition-all duration-300 overflow-hidden ${searchActive ? 'w-64' : 'w-40'}`}>
            <div className="relative w-full">
              <Input 
                className={`pl-9 py-1 h-8 bg-slate-50 border-slate-200 focus:border-blue-300 transition-all duration-300 ${searchActive ? 'pr-8' : ''}`}
                placeholder="Search..." 
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

          {/* Enhanced Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
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
                    onClick={() => onSectionChange(item.id)}
                    className={`relative flex items-center space-x-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Enhanced User Menu */}
          <div className="flex items-center space-x-4">
            {/* Help button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-blue-50 hover:text-blue-700 transition-colors">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </motion.div>
            
            {/* Notifications */}
            <div className="relative">
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      <Bell className="h-4 w-4" />
                      {recentNotifications.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white">
                          {recentNotifications.length}
                        </Badge>
                      )}
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-xl">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {recentNotifications.length} new
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {recentNotifications.map((notification, index) => (
                    <DropdownMenuItem key={index} className={`p-3 my-1 rounded-md ${getNotificationStyle(notification.type)} border`}>
                      <div className="space-y-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs">{notification.desc}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs opacity-70">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 cursor-pointer">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem 
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={activeSection === item.id ? 'bg-blue-50 text-blue-600' : ''}
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

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-3 hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-xl">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSectionChange('profile')} className="py-3 focus:bg-blue-50 focus:text-blue-700">
                  <User className="mr-3 h-4 w-4" />
                  <div>
                    <div className="font-medium">Profile</div>
                    <div className="text-xs text-slate-500">Manage your account</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSectionChange('settings')} className="py-3 focus:bg-blue-50 focus:text-blue-700">
                  <Settings className="mr-3 h-4 w-4" />
                  <div>
                    <div className="font-medium">Settings</div>
                    <div className="text-xs text-slate-500">Preferences & privacy</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 py-3 focus:bg-red-50 focus:text-red-700">
                  <LogOut className="mr-3 h-4 w-4" />
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-500">Log out of your account</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
