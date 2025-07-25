import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import StatsSection from "@/components/StatsSection";
import { complaintService, statsService } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  Users, 
  MapPin, 
  Clock, 
  Zap, 
  Eye, 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Lock,
  Star,
  TrendingUp,
  Award,
  ChevronDown,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  UserCheck,
  Settings,
  Activity,
  AlertCircle,
  Users2,
  RefreshCw
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [loginType, setLoginType] = useState<'citizen' | 'admin'>('citizen');
  const [liveComplaints, setLiveComplaints] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0,
    todayComplaints: 0,
    activeCitizens: 0,
    responseRate: 0
  });
  const [loadingLiveData, setLoadingLiveData] = useState(true);
  const [isVisible, setIsVisible] = useState({
    features: false,
    benefits: false,
    testimonials: false,
  });

  useEffect(() => {
    if (user) {
      navigate('/app');
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      setIsVisible({
        features: window.scrollY > 300,
        benefits: window.scrollY > 700,
        testimonials: window.scrollY > 1200,
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    // Fetch live data initially
    fetchLiveData();
    
    // Update live data every 30 seconds
    const liveDataInterval = setInterval(fetchLiveData, 30000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(featureInterval);
      clearInterval(liveDataInterval);
    };
  }, [user, navigate]);

  const fetchLiveData = async () => {
    try {
      setLoadingLiveData(true);
      
      // Fetch real live stats from the public API endpoint
      const liveStatsData = await statsService.getPublicLiveStats();
      
      setLiveStats(liveStatsData.stats);
      setLiveComplaints(liveStatsData.recentComplaints || []);
      
    } catch (error) {
      console.error('Error fetching live data:', error);
      
      // Fallback to complaints API if live stats fails
      try {
        const complaintsResponse = await complaintService.getComplaints({ limit: 5 });
        const complaints = complaintsResponse.complaints || [];
        
        setLiveComplaints(complaints);
        
        // Calculate basic statistics from complaints
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const resolvedToday = complaints.filter(complaint => {
          const updatedDate = new Date(complaint.updatedAt);
          return complaint.status === 'resolved' && updatedDate >= today;
        }).length;

        const todayComplaints = complaints.filter(complaint => {
          const createdDate = new Date(complaint.createdAt);
          return createdDate >= today;
        }).length;

        const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
        const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
        const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;

        setLiveStats({
          totalComplaints: complaints.length,
          pendingComplaints,
          resolvedComplaints,
          inProgressComplaints,
          todayComplaints,
          activeCitizens: Math.floor(Math.random() * 50) + 20, // Simulated for fallback
          responseRate: complaints.length > 0 ? Math.round(((resolvedComplaints + inProgressComplaints) / complaints.length) * 100) : 0
        });
        
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
      }
    } finally {
      setLoadingLiveData(false);
    }
  };

  const handleLoginNavigation = (role: 'citizen' | 'admin') => {
    setLoginType(role);
    // Navigate to app with role parameter
    navigate(`/app?role=${role}`);
  };

  const features = [
    {
      icon: Shield,
      title: "Immutable Records",
      description: "Every complaint is permanently recorded on blockchain. No deletion, no tampering, just truth.",
      gradient: "from-blue-500 via-blue-600 to-purple-600",
      delay: "0ms"
    },
    {
      icon: Users,
      title: "Public Transparency",
      description: "Open dashboard where every citizen can track the real-time status of civic issues.",
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      delay: "200ms"
    },
    {
      icon: Zap,
      title: "Smart Accountability",
      description: "Automated tracking, department assignment, and response time monitoring for true accountability.",
      gradient: "from-purple-500 via-violet-500 to-pink-600",
      delay: "400ms"
    }
  ];

  const benefits = [
    {
      icon: Lock,
      title: "Blockchain Security",
      description: "Complaints stored on immutable blockchain",
      color: "blue"
    },
    {
      icon: Eye,
      title: "Full Transparency",
      description: "Public tracking of all civic issues",
      color: "green"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live status updates and notifications",
      color: "orange"
    },
    {
      icon: Globe,
      title: "Community Impact",
      description: "Collective civic engagement platform",
      color: "purple"
    }
  ];

  const stats = [
    { value: "10K+", label: "Issues Resolved", icon: CheckCircle },
    { value: "87%", label: "Success Rate", icon: TrendingUp },
    { value: "24h", label: "Avg Response", icon: Clock },
    { value: "50+", label: "Cities", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 overflow-hidden">
      {/* Enhanced Header with refined animations */}
      <header className={`border-b sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-blue-500/10' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-500 transform group-hover:rotate-6">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  NyayChain
                </h1>
                <p className="text-sm text-slate-600 font-medium">Blockchain Governance Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    className="bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2"
                  >
                    Sign In
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-blue-200">
                  <DropdownMenuLabel className="text-slate-700 font-semibold">Choose Login Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleLoginNavigation('citizen')}
                    className="py-3 focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                  >
                    <Users className="mr-3 h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Citizen Login</div>
                      <div className="text-xs text-slate-500">Report and track issues</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLoginNavigation('admin')}
                    className="py-3 focus:bg-green-50 focus:text-green-700 cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Admin Login</div>
                      <div className="text-xs text-slate-500">Manage and resolve issues</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with 3D effects and parallax */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Dynamic background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* 3D Floating Elements */}
        <div className="absolute top-40 right-[15%] w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-70 animate-float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-40 left-[10%] w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60 animate-float" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute top-[35%] left-[20%] w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg opacity-70 animate-float" style={{animationDelay: '0.8s'}}></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full mb-8 shadow-lg transform hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold">🔗 Powered by Blockchain Technology</span>
            </div>
            
            <h2 className="text-7xl font-bold mb-8 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-emerald-800 bg-clip-text text-transparent">
                End the Blame Game.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Start the Solution.
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto font-medium animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Every pothole, every broken streetlight, every civic issue deserves accountability. 
              NyayChain creates an immutable, transparent record of public grievances that 
              <strong className="text-blue-700 font-semibold"> cannot be ignored, altered, or lost</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/app')}
                className="text-lg px-10 py-6 h-auto border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
              >
                <Eye className="h-5 w-5 mr-2 group-hover:text-blue-600 transition-colors" />
                <span className="group-hover:text-blue-600 transition-colors">View Public Dashboard</span>
              </Button>
            </div>

            {/* Live Complaints Dashboard */}
            <div className="w-full max-w-6xl mx-auto mt-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2">
                  <Activity className="h-4 w-4 mr-2" />
                  Live Dashboard
                </Badge>
                <h3 className="text-3xl font-bold mb-2">Real-Time Complaint Activity</h3>
                <p className="text-slate-600">Live updates from citizens across the platform</p>
              </div>

              {/* Live Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingLiveData ? '...' : liveStats.totalComplaints}
                    </div>
                    <div className="text-xs opacity-90">Total Complaints</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingLiveData ? '...' : liveStats.resolvedComplaints}
                    </div>
                    <div className="text-xs opacity-90">Resolved</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-8 w-8" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingLiveData ? '...' : liveStats.pendingComplaints}
                    </div>
                    <div className="text-xs opacity-90">Pending</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <div className="text-2xl font-bold">
                      {loadingLiveData ? '...' : liveStats.activeCitizens}
                    </div>
                    <div className="text-xs opacity-90">Active Citizens</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Complaints Feed */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        Live Complaints Feed
                      </CardTitle>
                      <CardDescription>Real-time complaints from citizens across the platform</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchLiveData}
                        disabled={loadingLiveData}
                        className="border-green-200 hover:border-green-300 hover:bg-green-50"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingLiveData ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/app')}
                        className="border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                      >
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingLiveData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex space-x-4">
                            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : liveComplaints.length > 0 ? (
                    <div className="space-y-4">
                      {liveComplaints.slice(0, 5).map((complaint, index) => (
                        <div 
                          key={complaint.id || complaint._id} 
                          className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-all duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {(complaint.title || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-slate-900 truncate">
                                  {complaint.title || 'Untitled Complaint'}
                                </h4>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                  {complaint.description || 'No description available'}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {complaint.location || 'Unknown location'}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {complaint.timeAgo || new Date(complaint.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    complaint.status === 'resolved' 
                                      ? 'bg-green-100 text-green-700' 
                                      : complaint.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {(complaint.status || 'pending').replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show a summary if there are more complaints */}
                      {liveComplaints.length > 5 && (
                        <div className="text-center py-4 border-t border-slate-200">
                          <p className="text-sm text-slate-600">
                            +{liveComplaints.length - 5} more complaints available
                          </p>
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => navigate('/app')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View all complaints
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent complaints to display</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Moved to the beginning */}
      <StatsSection />

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2">
              Why NyayChain?
            </Badge>
            <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Built for Transparency
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Leveraging blockchain technology to ensure transparency, accountability, and trust in civic governance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                  style={{ animationDelay: feature.delay }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base leading-relaxed text-slate-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2">
                How It Works
              </Badge>
              <h3 className="text-5xl font-bold mb-8 bg-gradient-to-r from-slate-900 to-emerald-800 bg-clip-text text-transparent">
                Transparency in Action
              </h3>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                NyayChain leverages blockchain technology to create an unalterable record of civic complaints, 
                ensuring that every issue is tracked, every response is recorded, and every resolution is verified.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  const colorClasses = {
                    blue: "from-blue-500 to-blue-600",
                    green: "from-emerald-500 to-emerald-600",
                    orange: "from-orange-500 to-orange-600",
                    purple: "from-purple-500 to-purple-600"
                  };
                  
                  return (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[benefit.color]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-2 text-slate-900">{benefit.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-sm">
                <h4 className="text-2xl font-bold mb-8 text-center text-slate-900">The Process</h4>
                <div className="space-y-6">
                  {[
                    { step: 1, text: "Submit complaint with photo & location", gradient: "from-blue-500 to-blue-600" },
                    { step: 2, text: "Blockchain records immutable entry", gradient: "from-emerald-500 to-emerald-600" },
                    { step: 3, text: "Department receives automatic assignment", gradient: "from-purple-500 to-purple-600" },
                    { step: 4, text: "Public tracking until resolution", gradient: "from-orange-500 to-orange-600" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 group">
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        {item.step}
                      </div>
                      <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-20 pb-10 border-t-4 border-blue-500/30">
        <div className="container mx-auto px-4">
          {/* Newsletter Section */}
          <div className="relative mb-16 bg-blue-600/10 rounded-2xl p-8 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="absolute -top-8 left-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center pt-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                <p className="text-blue-100">Get the latest news on civic governance innovations</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 py-3">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">NyayChain</h3>
                  <p className="text-sm text-slate-400">Blockchain Governance Platform</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                Building transparent, accountable governance through blockchain technology. Our platform connects citizens, authorities, and communities for effective civic issue resolution.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4 mb-6">
                {[
                  { icon: Facebook, color: "hover:bg-blue-600" },
                  { icon: Twitter, color: "hover:bg-sky-500" },
                  { icon: Instagram, color: "hover:bg-pink-600" },
                  { icon: Linkedin, color: "hover:bg-blue-700" }
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={index} 
                      href="#" 
                      className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${social.color} hover:text-white transition-all duration-300`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
            
            {/* Links Columns */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-blue-300">Platform</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Submit Complaint</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Public Dashboard</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Blockchain Explorer</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  <span>API Access</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg text-emerald-300">Resources</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>Documentation</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>Open Source Code</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>Community Forum</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>Developer Hub</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-lg text-purple-300">Company</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-purple-500" />
                  <span>About Us</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-purple-500" />
                  <span>Our Mission</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-purple-500" />
                  <span>Privacy Policy</span>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer hover:translate-x-1 duration-300 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 text-purple-500" />
                  <span>Contact Us</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-slate-700/50 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 mb-4 md:mb-0 text-sm">© {new Date().getFullYear()} NyayChain. All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Terms</a>
                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy</a>
                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Security</a>
                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
