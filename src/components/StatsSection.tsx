import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CheckCircle, Clock, AlertCircle, Users, Calendar, Activity } from "lucide-react";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2000, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = progress * end;
      
      if (decimals === 0) {
        setCount(Math.floor(currentCount));
      } else {
        setCount(Number(currentCount.toFixed(decimals)));
      }
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, decimals]);
  
  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const LiveBadge = () => {
  const [blink, setBlink] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${blink ? 'bg-red-500' : 'bg-red-300'} transition-colors duration-500`}></div>
      <span>LIVE</span>
    </div>
  );
};

interface StatsData {
  totalComplaints: number;
  resolved: number;
  inProgress: number;
  pending: number;
  avgResolutionTime: number;
  citizensSatisfaction: number;
  departmentResponse: number;
}

const StatsSection = () => {
  // Base stats data
  const [stats, setStats] = useState<StatsData>({
    totalComplaints: 1247,
    resolved: 892,
    inProgress: 234,
    pending: 121,
    avgResolutionTime: 4.2,
    citizensSatisfaction: 87,
    departmentResponse: 94
  });
  
  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Random small changes to simulate live data
        const randomChange = () => Math.random() > 0.5 ? 1 : 0;
        const smallRandomChange = () => Math.random() > 0.7 ? 0.1 : 0;
        
        // Calculate pending change with proper parentheses
        const pendingChange = Math.random() > 0.8 ? (randomChange() - 1) : randomChange();
        
        return {
          totalComplaints: prev.totalComplaints + randomChange(),
          resolved: prev.resolved + randomChange(),
          inProgress: prev.inProgress + (Math.random() > 0.8 ? 1 : 0),
          pending: prev.pending + pendingChange,
          avgResolutionTime: Number(Math.max(3.8, Math.min(4.5, prev.avgResolutionTime + ((Math.random() > 0.5 ? 0.1 : -0.1) * smallRandomChange()))).toFixed(1)),
          citizensSatisfaction: Math.min(100, prev.citizensSatisfaction + (Math.random() > 0.8 ? 1 : 0)),
          departmentResponse: Math.min(100, prev.departmentResponse + (Math.random() > 0.9 ? 1 : 0))
        };
      });
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const resolutionRate = Math.round((stats.resolved / stats.totalComplaints) * 100);
  
  // Generate dynamic timestamps
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    return 'just now';
  };
  
  return (
    <section className="py-12 px-4 bg-gradient-to-br from-white/80 via-slate-50/60 to-blue-50/40">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 flex items-center gap-2 mx-auto w-fit">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <LiveBadge />
              <span>Real-time Analytics</span>
            </div>
          </Badge>
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">Transparency in Numbers</h3>
          <p className="text-gray-600">Live statistics from our blockchain-powered accountability system</p>
          <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
            <span>Last updated:</span> 
            <span className="font-medium text-blue-600">{formatTimeAgo(lastUpdated)}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Complaints */}
          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <div className="relative">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold relative">
                <CountUp end={stats.totalComplaints} />
                <span className="absolute top-0 -right-3 text-xs text-green-500 font-normal">+</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Resolved */}
          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-300 to-green-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <div className="relative">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                <CountUp end={stats.resolved} />
              </div>
              <div className="flex items-center text-xs mt-1">
                <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
                  <CountUp end={resolutionRate} suffix="%" duration={1500} />
                </div>
                <span className="ml-1 text-muted-foreground">resolution rate</span>
              </div>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-300 to-blue-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                <CountUp end={stats.inProgress} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Active resolution ongoing</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-yellow-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-600"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                <CountUp end={stats.pending} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Awaiting department response</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Resolution Rate</span>
              </CardTitle>
              <CardDescription>Percentage of complaints successfully resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Resolution</span>
                  <span className="font-medium"><CountUp end={resolutionRate} suffix="%" duration={1500} /></span>
                </div>
                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${resolutionRate}%`, transition: 'width 1s ease-in-out' }}></div>
                </div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+8% improvement this quarter</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Response Time</span>
              </CardTitle>
              <CardDescription>Average time for initial department response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">
                    <CountUp end={parseFloat(stats.avgResolutionTime)} decimals={1} />
                  </div>
                  <span className="ml-1 text-sm text-gray-600">days average</span>
                </div>
                <div className="relative w-full h-1 bg-gray-100 rounded-full mt-2">
                  <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-300 to-green-600 rounded-full" style={{ width: `${(Number(stats.avgResolutionTime) / 10) * 100}%`, transition: 'all 1s ease' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target: 5 days</span>
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>Under target</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="civic-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Citizen Satisfaction</span>
              </CardTitle>
              <CardDescription>User feedback on complaint resolution process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Satisfaction Score</span>
                  <span className="font-medium"><CountUp end={stats.citizensSatisfaction} suffix="%" duration={1500} /></span>
                </div>
                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: `${stats.citizensSatisfaction}%`, transition: 'width 1s ease-in-out' }}></div>
                </div>
                <p className="text-xs text-purple-600">Based on <CountUp end={1200} suffix="+" duration={1000} /> reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Trust Indicators */}
        <Card className="civic-card mt-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-100">
          <CardHeader>
            <CardTitle className="text-center">🔗 Blockchain Trust Metrics</CardTitle>
            <CardDescription className="text-center">
              Immutable transparency indicators powered by distributed ledger technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <p className="text-sm text-gray-600">Data Immutability</p>
                <p className="text-xs text-gray-500">Records cannot be altered</p>
              </div>
              <div className="space-y-2 p-3 rounded-lg hover:bg-green-50 transition-colors">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <p className="text-sm text-gray-600">Public Accessibility</p>
                <p className="text-xs text-gray-500">Always available for audit</p>
              </div>
              <div className="space-y-2 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                <div className="text-2xl font-bold text-purple-600">
                  <CountUp end={0} duration={800} />
                </div>
                <p className="text-sm text-gray-600">Hidden Records</p>
                <p className="text-xs text-gray-500">Complete transparency</p>
              </div>
              <div className="space-y-2 p-3 rounded-lg hover:bg-orange-50 transition-colors">
                <div className="text-2xl font-bold text-orange-600">∞</div>
                <p className="text-sm text-gray-600">Permanent Storage</p>
                <p className="text-xs text-gray-500">Records stored forever</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Last block timestamp */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Last block mined: <span className="font-medium text-blue-600">{new Date().toLocaleTimeString()}</span> | 
            Hash: <span className="font-mono text-xs">0x{Math.random().toString(16).substring(2, 10).toUpperCase()}...</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
