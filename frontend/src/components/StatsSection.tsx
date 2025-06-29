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
  
  return null;
};

export default StatsSection;
