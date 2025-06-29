import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatsSection from '../StatsSection';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userService, complaintService, statsService } from '@/services/api';
import { useToast } from "@/hooks/use-toast";
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

interface Complaint {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  location: {
    address: string;
  };
  priority: string;
  category: string;
}

interface UserStats {
  totalComplaints: number;
  pendingComplaints: number;
  avgResponseTime: number;
  resolutionRate: number;
  communityImpact: number;
}

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    avgResponseTime: 24,
    resolutionRate: 0,
    communityImpact: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const fetchUserComplaints = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserComplaints({ limit: 3, sort: '-createdAt' });
      setRecentComplaints(response.data.complaints);
      
      // Fetch user stats including dynamic average response time
      const userStatsResponse = await userService.getUserStats();
      
      // Calculate user stats from the complaints
      const allComplaints = await userService.getUserComplaints();
      const complaints = allComplaints.data.complaints;
      
      const totalComplaints = complaints.length;
      const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
      
      // Calculate resolution rate
      const resolutionRate = totalComplaints > 0 
        ? Math.round((resolvedComplaints / totalComplaints) * 100) 
        : 0;
      
      // Fetch overall stats to compare for community impact
      const overallStats = await statsService.getSummary();
      
      // Calculate comparison for response time
      let responseComparison = "Response time";
      if (userStatsResponse.avgResponseTime > 0 && overallStats.avgResponseTime > 0) {
        const improvement = overallStats.avgResponseTime - userStatsResponse.avgResponseTime;
        if (improvement > 0) {
          responseComparison = `${Math.round(improvement)}h faster`;
        } else if (improvement < 0) {
          responseComparison = `${Math.round(Math.abs(improvement))}h slower`;
        } else {
          responseComparison = "Average";
        }
      }
      
      setUserStats({
        totalComplaints,
        pendingComplaints,
        avgResponseTime: userStatsResponse.avgResponseTime || 0, // Use dynamic response time
        resolutionRate,
        communityImpact: resolutionRate > 0 
          ? Math.round((resolutionRate / overallStats.responseRate) * 100 - 100) 
          : 0
      });

      // Store response comparison for display
      (window as any).responseComparison = responseComparison;
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      toast({
        title: "Error loading dashboard data",
        description: "Could not load your complaint data. Please try again later.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserComplaints();
  }, []);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserComplaints().finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  const quickActions = [
    {
      icon: FileText,
      title: 'Submit New Issue',
      description: 'Report a civic problem',
      gradient: 'from-blue-500 to-purple-500',
      action: () => navigate('/app/submit')
    },
    {
      icon: MapPin,
      title: 'View Public Map',
      description: 'See community issues',
      gradient: 'from-emerald-500 to-blue-500',
      action: () => navigate('/app/map')
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
                    onClick={action.action}
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
            value: loading ? "..." : userStats.totalComplaints.toString(),
            secondary: loading ? "loading..." : `${userStats.pendingComplaints} pending`,
            secondaryType: "badge",
            icon: FileText,
            color: "blue"
          },
          {
            title: "Avg. Response",
            value: loading ? "..." : userStats.avgResponseTime > 0 ? `${userStats.avgResponseTime}h` : "N/A",
            secondary: loading ? "loading..." : userStats.avgResponseTime > 0 ? (window as any).responseComparison || "Response time" : "No responses yet",
            secondaryType: "trend",
            icon: Clock,
            color: "emerald"
          },
          {
            title: "Resolution Rate",
            value: loading ? "..." : `${userStats.resolutionRate}%`,
            secondary: loading ? "loading..." : "5% improvement",
            secondaryType: "trend",
            icon: CheckCircle,
            color: "purple"
          },
          {
            title: "Community Impact",
            value: loading ? "..." : (userStats.communityImpact > 0 ? `+${userStats.communityImpact}%` : `${userStats.communityImpact}%`),
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
                        <span className={`text-xs text-${stat.color}-600`}>{stat.secondary}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest submitted civic issues</CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">You haven't submitted any complaints yet.</p>
                <Button onClick={() => navigate('/app/submit')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Submit Your First Issue
                </Button>
              </div>
            ) : (
              recentComplaints.map((complaint, index) => {
                return (
                  <motion.div
                    key={complaint._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/app/complaints/${complaint._id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs px-1.5 py-0">
                          {complaint._id.substring(0, 6)}
                        </Badge>
                        <Badge className={`${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority || 'Medium'}
                        </Badge>
                      </div>
                      <Badge className={`${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{complaint.title}</h3>
                    <div className="flex items-center space-x-3 mt-3 text-sm text-slate-500">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{complaint.location.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{formatRelativeTime(complaint.createdAt)}</span>
                      </div>
                      <div className="ml-auto">
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            {recentComplaints.length > 0 && (
              <div className="pt-4 text-center">
                <Button variant="outline" className="w-full" onClick={() => navigate('/app/profile')}>
                  View All Complaints
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Section */}
      <StatsSection />
    </div>
  );
};

export default Dashboard;
