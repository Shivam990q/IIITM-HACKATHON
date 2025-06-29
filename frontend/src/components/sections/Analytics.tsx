
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { categoryService } from "@/services/api";

const Analytics = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Fetch categories and generate analytics data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        const fetchedCategories = response.data.categories;
        setCategories(fetchedCategories);
        
        // Generate dynamic category data for analytics
        const dynamicCategoryData = fetchedCategories.map((category: any, index: number) => ({
          name: category.name,
          value: Math.floor(Math.random() * 40) + 5, // Random data for demo
          color: category.color,
        }));
        setCategoryData(dynamicCategoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to static data
        setCategoryData([
          { name: 'Road Issues', value: 35, color: '#8884d8' },
          { name: 'Street Lights', value: 25, color: '#82ca9d' },
          { name: 'Waste Management', value: 20, color: '#ffc658' },
          { name: 'Water Supply', value: 15, color: '#ff7300' },
          { name: 'Others', value: 5, color: '#00ff88' },
        ]);
      }
    };

    fetchCategories();
  }, []);

  const monthlyData = [
    { month: 'Jan', complaints: 45, resolved: 38, pending: 7 },
    { month: 'Feb', complaints: 52, resolved: 47, pending: 5 },
    { month: 'Mar', complaints: 48, resolved: 41, pending: 7 },
    { month: 'Apr', complaints: 61, resolved: 55, pending: 6 },
    { month: 'May', complaints: 55, resolved: 50, pending: 5 },
    { month: 'Jun', complaints: 67, resolved: 61, pending: 6 },
  ];

  const departmentPerformance = [
    { department: 'Public Works', complaints: 45, resolved: 41, rate: 91 },
    { department: 'Electricity', complaints: 32, resolved: 28, rate: 88 },
    { department: 'Water Dept', complaints: 28, resolved: 22, rate: 79 },
    { department: 'Waste Mgmt', complaints: 35, resolved: 32, rate: 91 },
    { department: 'Traffic', complaints: 20, resolved: 16, rate: 80 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into civic complaint trends and department performance
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          <Activity className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">328</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.2%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18h</div>
                <p className="text-xs text-muted-foreground">-4h from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">-8 from yesterday</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Complaint Trends</CardTitle>
              <CardDescription>
                Track complaint submission and resolution patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="complaints" fill="#3b82f6" name="Total Complaints" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Trend Analysis</CardTitle>
              <CardDescription>
                Track how efficiently complaints are being resolved over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="complaints" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Complaints"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Categories</CardTitle>
                <CardDescription>
                  Distribution of complaints by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Statistics</CardTitle>
                <CardDescription>
                  Detailed breakdown by complaint type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{category.value}%</div>
                        <div className="text-sm text-muted-foreground">
                          ~{Math.round(category.value * 3.28)} complaints
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>
                Resolution rates and efficiency metrics by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentPerformance.map((dept, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{dept.department}</h3>
                      <Badge 
                        variant="secondary"
                        className={
                          dept.rate >= 90 ? 'bg-green-100 text-green-700' :
                          dept.rate >= 80 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }
                      >
                        {dept.rate}% resolved
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Complaints</p>
                        <p className="font-bold text-lg">{dept.complaints}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Resolved</p>
                        <p className="font-bold text-lg text-green-600">{dept.resolved}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-bold text-lg text-orange-600">{dept.complaints - dept.resolved}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${dept.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
