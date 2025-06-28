
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Eye, Filter, Search, TrendingUp } from "lucide-react";

// Mock complaint data
const mockComplaints = [
  {
    id: "NYC-1703847234567",
    title: "Pothole on MG Road",
    category: "Road & Infrastructure",
    status: "In Progress",
    location: "MG Road, Bengaluru",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    timestamp: "2024-01-15T10:30:00Z",
    description: "Large pothole causing traffic issues and vehicle damage",
    department: "BBMP Road Maintenance",
    estimatedResolution: "7 days",
    priority: "High"
  },
  {
    id: "NYC-1703847234568",
    title: "Broken Street Light",
    category: "Street Lighting",
    status: "Acknowledged",
    location: "Brigade Road, Bengaluru",
    coordinates: { lat: 12.9698, lng: 77.6205 },
    timestamp: "2024-01-14T14:20:00Z",
    description: "Street light not functioning for past week",
    department: "BESCOM",
    estimatedResolution: "3 days",
    priority: "Medium"
  },
  {
    id: "NYC-1703847234569",
    title: "Garbage Collection Missed",
    category: "Waste Management",
    status: "Resolved",
    location: "Koramangala, Bengaluru",
    coordinates: { lat: 12.9352, lng: 77.6245 },
    timestamp: "2024-01-13T08:15:00Z",
    description: "Garbage not collected for 3 days in residential area",
    department: "BBMP Waste Management",
    estimatedResolution: "Completed",
    priority: "High"
  },
  {
    id: "NYC-1703847234570",
    title: "Water Supply Disruption",
    category: "Water Supply",
    status: "Under Review",
    location: "Whitefield, Bengaluru",
    coordinates: { lat: 12.9698, lng: 77.7500 },
    timestamp: "2024-01-16T06:45:00Z",
    description: "No water supply for entire apartment complex",
    department: "BWSSB",
    estimatedResolution: "5 days",
    priority: "High"
  }
];

const DashboardMap = () => {
  const [complaints, setComplaints] = useState(mockComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
          Real-time transparency into civic complaints and their resolution status
        </p>
        <div className="flex justify-center mt-4 space-x-2">
          <Badge className="bg-green-100 text-green-700">
            🔗 Live Blockchain Data
          </Badge>
          <Badge className="bg-blue-100 text-blue-700">
            👁️ Publicly Verifiable
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="civic-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
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
              <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Map pins simulation */}
                <div className="absolute inset-0 p-4">
                  {filteredComplaints.map((complaint, index) => (
                    <div 
                      key={complaint.id}
                      className={`absolute w-4 h-4 rounded-full cursor-pointer transform hover:scale-150 transition-all duration-200 ${
                        complaint.status === 'Resolved' ? 'bg-green-500' :
                        complaint.status === 'In Progress' ? 'bg-blue-500' :
                        complaint.status === 'Acknowledged' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`}
                      style={{
                        left: `${20 + (index * 15) % 60}%`,
                        top: `${20 + (index * 20) % 60}%`
                      }}
                      onClick={() => setSelectedComplaint(complaint)}
                      title={complaint.title}
                    />
                  ))}
                </div>
                <div className="text-center text-gray-600">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold">Interactive Map View</p>
                  <p className="text-sm">Click on pins to view complaint details</p>
                  <p className="text-xs mt-2 text-gray-500">
                    🟢 Resolved | 🔵 In Progress | 🟡 Acknowledged | 🟣 Under Review
                  </p>
                </div>
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
