import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, MessageSquare, CheckCircle, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockComplaints = [
  {
    id: "C12345",
    title: "Broken Streetlight on Main Avenue",
    status: "pending",
    category: "Infrastructure",
    location: "Ward 5, Block B",
    date: "2023-06-27",
    upvotes: 24,
    priority: "medium",
    assignedTo: null,
  },
  {
    id: "C12346",
    title: "Garbage Collection Missed for 3 Days",
    status: "in-progress",
    category: "Sanitation",
    location: "Ward 2, Sector 7",
    date: "2023-06-26",
    upvotes: 18,
    priority: "high",
    assignedTo: "Official 1",
  }
];

const ComplaintManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "in-progress": return <AlertCircle className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-slate-600";
      case "medium": return "text-amber-600";
      case "high": return "text-red-600";
      default: return "text-slate-600";
    }
  };

  const filteredComplaints = mockComplaints.filter(complaint => {
    const matchesSearch = 
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complaint Management</h1>
          <p className="text-slate-500 mt-1">Review and manage citizen complaints</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>View, filter, and manage all complaints in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search complaints..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Assigned To</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{complaint.id}</td>
                    <td className="py-3 px-4">{complaint.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={getStatusColor(complaint.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(complaint.status)}
                          <span>{complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}</span>
                        </span>
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{complaint.category}</td>
                    <td className="py-3 px-4 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{complaint.location}</span>
                    </td>
                    <td className="py-3 px-4">{complaint.date}</td>
                    <td className={`py-3 px-4 ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                    </td>
                    <td className="py-3 px-4">
                      {complaint.assignedTo || <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Assign Official</DropdownMenuItem>
                          <DropdownMenuItem>Change Status</DropdownMenuItem>
                          <DropdownMenuItem>Change Priority</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredComplaints.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="mt-2 text-lg font-medium">No complaints found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintManagement;
