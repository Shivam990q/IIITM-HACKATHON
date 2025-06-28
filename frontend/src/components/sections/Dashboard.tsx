import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatsSection from '../StatsSection';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  Users,
  Activity,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Search,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  const recentComplaints = [
    {
      id: 'NYC001',
      title: 'Broken Street Light on MG Road',
      status: 'In Progress',
      date: '2 hours ago',
      location: 'MG Road, Sector 14',
      priority: 'Medium',
      department: 'Electricity'
    },
    {
      id: 'NYC002',
      title: 'Pothole near City Mall',
      status: 'Pending',
      date: '5 hours ago',
      location: 'City Mall Junction',
      priority: 'High',
      department: 'Roads'
    },
    {
      id: 'NYC003',
      title: 'Garbage Collection Missed',
      status: 'Resolved',
      date: '1 day ago',
      location: 'Residential Area B',
      priority: 'Low',
      department: 'Sanitation'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const quickActions = [
    {
      icon: FileText,
      title: 'Submit New Issue',
      description: 'Report a civic problem',
      gradient: 'from-blue-500 to-purple-500',
      action: 'submit'
    },
    {
      icon: MapPin,
      title: 'View Public Map',
      description: 'See community issues',
      gradient: 'from-emerald-500 to-blue-500',
      action: 'map'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'View insights & trends',
      gradient: 'from-purple-500 to-pink-500',
      action: 'analytics'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <motion.div
        className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 rounded-2xl p-8 text-white overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <motion.div 
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome Back!
              </motion.h1>
              <motion.p 
                className="text-blue-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Ready to make a difference in your community?
              </motion.p>
            </div>
          </div>
          
          <motion.p 
            className="text-lg text-blue-100 mb-6 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Track your civic complaints and monitor community progress with blockchain transparency. 
            Every issue matters, every voice counts.
          </motion.p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="secondary"
                    className="justify-start p-4 h-auto w-full bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm transition-all duration-300"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{action.title}</div>
                      <div className="text-sm text-blue-100">{action.description}</div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "My Complaints",
            value: "12",
            secondary: "3 pending",
            secondaryType: "badge",
            icon: FileText,
            color: "blue"
          },
          {
            title: "Avg. Response",
            value: "24h",
            secondary: "12% faster",
            secondaryType: "trend",
            icon: Clock,
            color: "emerald"
          },
          {
            title: "Resolution Rate",
            value: "87%",
            secondary: "5% improvement",
            secondaryType: "trend",
            icon: CheckCircle,
            color: "purple"
          },
          {
            title: "Community Impact",
            value: "+24%",
            secondary: "issues resolved",
            secondaryType: "trend",
            icon: Zap,
            color: "orange"
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className={`border-0 shadow-lg bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className={`text-sm font-semibold text-${stat.color}-700`}>{stat.title}</CardTitle>
                  <div className={`w-8 h-8 bg-${stat.color}-500 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold text-${stat.color}-700`}>{stat.value}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    {stat.secondaryType === "badge" && (
                      <Badge variant="secondary" className={`text-xs bg-${stat.color}-200 text-${stat.color}-700`}>{stat.secondary}</Badge>
                    )}
                    {stat.secondaryType === "trend" && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className={`h-3 w-3 text-${stat.color}-600`} />
                        <p className={`text-xs text-${stat.color}-600`}>{stat.secondary}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Activity Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Activity className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Your latest submitted civic issues</CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 border-slate-200"
                  onClick={handleRefresh}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.01 }}
                  className="group p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-300 hover:border-blue-200 bg-gradient-to-r from-white to-slate-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs font-mono bg-slate-100">
                          {complaint.id}
                        </Badge>
                        <Badge className={`${getPriorityColor(complaint.priority)} text-xs border`}>
                          {complaint.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(complaint.status)} text-xs border`}>
                          {complaint.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {complaint.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{complaint.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{complaint.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{complaint.department}</span>
                        </div>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.2, rotate: 15 }}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Stats</CardTitle>
            <CardDescription>Complaint resolution metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Resolution Rate</div>
                  <div className="text-sm text-slate-500">87%</div>
                </div>
                <motion.div 
                  className="w-full bg-slate-100 rounded-full h-2.5"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                    style={{ width: '87%' }}
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                  ></motion.div>
                </motion.div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Avg. Response Time</div>
                  <div className="text-sm text-slate-500">24 hours</div>
                </div>
                <motion.div 
                  className="w-full bg-slate-100 rounded-full h-2.5"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full"
                    style={{ width: '65%' }}
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                  ></motion.div>
                </motion.div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Community Satisfaction</div>
                  <div className="text-sm text-slate-500">92%</div>
                </div>
                <motion.div 
                  className="w-full bg-slate-100 rounded-full h-2.5"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                    style={{ width: '92%' }}
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ delay: 0.7, duration: 0.7 }}
                  ></motion.div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
