
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Eye, Filter, Search, TrendingUp, RefreshCw } from "lucide-react";
import { categoryService, complaintService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const DashboardMap = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch categories and complaints on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCategories(), fetchComplaints()]);
    };
    fetchData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Fetch all complaints - this is now public and shows all citizen complaints
      const response = await complaintService.getComplaints({ 
        limit: 100, // Get more complaints for the map
        sort: '-createdAt' 
      });
      
      // Transform the data to match our component structure
      const transformedComplaints = response.data.complaints.map((complaint: any) => ({
        id: complaint._id,
        title: complaint.title,
        category: complaint.category?.name || 'General',
        status: mapStatusToDisplay(complaint.status),
        location: complaint.location?.address || 'Location not specified',
        coordinates: { 
          lat: complaint.location?.coordinates?.[1] || 26.2124, 
          lng: complaint.location?.coordinates?.[0] || 78.1772 
        },
        timestamp: complaint.createdAt,
        description: complaint.description,
        department: complaint.department || getDepartmentFromCategory(complaint.category?.name),
        estimatedResolution: getEstimatedResolution(complaint.status),
        priority: complaint.priority || 'Medium',
        upvotes: complaint.upvotes?.length || 0,
        submittedBy: complaint.submittedBy?.name || 'Anonymous'
      }));
      
      setComplaints(transformedComplaints);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error loading complaints",
        description: "Could not load the latest complaints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchComplaints();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Helper functions
  const mapStatusToDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Under Review',
      'acknowledged': 'Acknowledged', 
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const getDepartmentFromCategory = (category: string) => {
    const departmentMap: { [key: string]: string } = {
      'Road & Infrastructure': 'Gwalior Municipal Corporation',
      'Street Lighting': 'MP Madhya Kshetra Vidyut Vitaran',
      'Waste Management': 'Gwalior Municipal Corporation Waste Management',
      'Water Supply': 'Gwalior Jal Nigam',
      'Traffic': 'Gwalior Traffic Police',
      'Health': 'Gwalior Health Department'
    };
    return departmentMap[category] || 'Municipal Corporation';
  };

  const getEstimatedResolution = (status: string) => {
    if (status === 'resolved') return 'Completed';
    if (status === 'in_progress') return '2-5 days';
    if (status === 'acknowledged') return '3-7 days';
    return '5-10 days';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Acknowledged": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesFilter = filter === "all" || complaint.status.toLowerCase().replace(" ", "-") === filter;
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Public Accountability Dashboard</h2>
        <p className="text-gray-600">
          Real-time transparency into all civic complaints from citizens across the city
        </p>
        <div className="flex justify-center mt-4 space-x-2">
          <Badge className="bg-green-100 text-green-700">
            🔗 Live Blockchain Data
          </Badge>
          <Badge className="bg-blue-100 text-blue-700">
            👁️ Publicly Verifiable
          </Badge>
          <Badge className="bg-purple-100 text-purple-700">
            🌐 All Citizens' Issues
          </Badge>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredComplaints.length}</p>
              <p className="text-sm text-gray-600">Total Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredComplaints.filter(c => c.status === 'Resolved').length}
              </p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredComplaints.filter(c => c.status === 'In Progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredComplaints.filter(c => c.status === 'Under Review').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="civic-card mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter & Search</span>
            </CardTitle>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing || loading}
              variant="outline" 
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search complaints by title, location, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading all citizen complaints...</p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
          <Card className="civic-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Geographic View</span>
                <Badge variant="outline">{filteredComplaints.length} complaints</Badge>
              </CardTitle>
              <CardDescription>
                Interactive map showing all public complaints across the city
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Google Maps Embed with Complaint Pins Overlay */}
              <div className="h-96 rounded-lg border relative overflow-hidden">
                {/* Google Maps Iframe */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114542.80185929636!2d78.19089894999999!3d26.21415585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c5d1792291fb%3A0xff4fb56d65bc3adf!2sGwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1751120764070!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />

                {/* Complaint Pins Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {filteredComplaints.map((complaint, index) => {
                    const getStatusPinColor = (status: string) => {
                      switch (status) {
                        case 'Resolved': return 'bg-green-500 border-green-600 shadow-green-300';
                        case 'In Progress': return 'bg-blue-500 border-blue-600 shadow-blue-300';
                        case 'Acknowledged': return 'bg-yellow-500 border-yellow-600 shadow-yellow-300';
                        case 'Under Review': return 'bg-purple-500 border-purple-600 shadow-purple-300';
                        default: return 'bg-gray-500 border-gray-600 shadow-gray-300';
                      }
                    };

                    // Position pins across Gwalior city (approximate locations)
                    const positions = [
                      { left: '45%', top: '35%' }, // Central Gwalior (MG Road area)
                      { left: '55%', top: '45%' }, // Lashkar area
                      { left: '35%', top: '55%' }, // Morar area
                      { left: '65%', top: '25%' }, // Thatipur area
                    ];
                    const position = positions[index % positions.length];

                    return (
                      <div
                        key={complaint.id}
                        className={`absolute w-6 h-6 rounded-full cursor-pointer transform hover:scale-125 transition-all duration-200 border-2 ${getStatusPinColor(complaint.status)} shadow-lg flex items-center justify-center pointer-events-auto z-10`}
                        style={position}
                        onClick={() => setSelectedComplaint(complaint)}
                        title={`${complaint.title} - ${complaint.status}`}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        {/* Pin tooltip on hover */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium text-gray-800 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {complaint.title}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map Legend Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-20">
                  <p className="text-xs font-semibold text-gray-800 mb-2">Gwalior Complaints Map</p>
                  <p className="text-xs text-gray-600">Click pins for details</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <span className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
                    Resolved
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border border-blue-600"></div>
                    In Progress
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
                    Acknowledged
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full border border-purple-600"></div>
                    Under Review
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaint Details Panel */}
        <div>
          <Card className="civic-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Complaint Details</span>
              </CardTitle>
              <CardDescription>
                {selectedComplaint ? "Blockchain-verified information" : "Select a complaint to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedComplaint ? (
                <div className="space-y-4">
                  <div>
                    <Badge className={getStatusColor(selectedComplaint.status)}>
                      {selectedComplaint.status}
                    </Badge>
                    <Badge className={`ml-2 ${getPriorityColor(selectedComplaint.priority)}`} variant="outline">
                      {selectedComplaint.priority} Priority
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg">{selectedComplaint.title}</h4>
                    <p className="text-sm text-gray-600">{selectedComplaint.category}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Description:</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Location:</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.location}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Department:</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.department}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Estimated Resolution:</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.estimatedResolution}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700">Blockchain ID:</p>
                    <p className="text-xs text-gray-600 font-mono">{selectedComplaint.id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(selectedComplaint.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Click on a map pin or complaint card to view detailed information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Complaints List */}
      <div className="mt-8">
        <Card className="civic-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>All Complaints</span>
              <Badge variant="outline">{filteredComplaints.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedComplaint?.id === complaint.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{complaint.title}</h4>
                        <Badge className={getStatusColor(complaint.status)} variant="secondary">
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {complaint.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(complaint.timestamp).toLocaleDateString()}
                        </span>
                        <span>{complaint.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMap;
