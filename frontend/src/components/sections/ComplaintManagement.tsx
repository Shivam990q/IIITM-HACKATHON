import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  MoreHorizontal,
  UserCheck,
  MessageSquare,
  Settings
} from 'lucide-react';
import { adminService } from '@/services/api';

const ComplaintManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    department: '',
    priority: '',
    note: ''
  });
  const [statusData, setStatusData] = useState({
    status: '',
    note: ''
  });
  const { toast } = useToast();

  // Fetch complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllComplaints({ limit: 50 });
      setComplaints(data.complaints || []);
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error loading complaints",
        description: "Could not load complaints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignComplaint = async () => {
    if (!selectedComplaint || !assignmentData.department) {
      toast({
        title: "Missing information",
        description: "Please select a department to assign the complaint.",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminService.assignComplaint(selectedComplaint._id, assignmentData);
      
      toast({
        title: "Complaint assigned successfully",
        description: `Complaint has been assigned to ${assignmentData.department}`,
      });
      
      setIsAssignDialogOpen(false);
      setAssignmentData({ department: '', priority: '', note: '' });
      fetchComplaints(); // Refresh the list
    } catch (error: any) {
      console.error('Error assigning complaint:', error);
      toast({
        title: "Assignment failed",
        description: error.message || "Could not assign complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !statusData.status) {
      toast({
        title: "Missing information",
        description: "Please select a status to update.",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminService.updateComplaintStatus(selectedComplaint._id, statusData);
      
      toast({
        title: "Status updated successfully",
        description: `Complaint status has been updated to ${statusData.status}`,
      });
      
      setIsStatusDialogOpen(false);
      setStatusData({ status: '', note: '' });
      fetchComplaints(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Status update failed",
        description: error.message || "Could not update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (complaint: any) => {
    try {
      const detailedComplaint = await adminService.getComplaintDetails(complaint._id);
      setSelectedComplaint(detailedComplaint);
      setIsDetailsDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching complaint details:', error);
      toast({
        title: "Error loading details",
        description: "Could not load complaint details. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics from real complaints data
  const getStatistics = () => {
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress' || c.status === 'assigned').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const total = complaints.length;
    
    return { pending, inProgress, resolved, total };
  };

  const stats = getStatistics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = (complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.submittedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRefresh = () => {
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Complaint Management</h1>
          <p className="text-slate-600">Review, assign, and manage citizen complaints</p>
        </div>
        <div className="flex space-x-2">          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
          <CardDescription>
            Manage and track the status of citizen complaints
          </CardDescription>
        </CardHeader>        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-600">Loading complaints...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No complaints found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge variant="outline" className="font-mono">
                          {complaint._id?.slice(-6).toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(complaint.status)} border`}>
                          {complaint.status?.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(complaint.priority)} border`}>
                          {complaint.priority} priority
                        </Badge>
                        {complaint.upvotes > 0 && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            {complaint.upvotes} upvotes
                          </Badge>
                        )}
                      </div>

                      {/* Title and Description */}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {complaint.title}
                      </h3>
                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {complaint.description}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Submitted by: {complaint.submittedBy?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{complaint.location?.address || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(complaint.createdAt)}</span>
                        </div>
                      </div>

                      {/* Assignment */}
                      <div className="mt-3 flex items-center space-x-4">
                        <Badge variant="secondary">
                          {complaint.category?.name || 'Uncategorized'}
                        </Badge>
                        {complaint.assignedTo && (
                          <div className="text-sm text-slate-600">
                            Assigned to: <span className="font-medium">{complaint.assignedTo.name}</span>
                          </div>
                        )}
                        {complaint.media?.length > 0 && (
                          <div className="text-sm text-slate-600">
                            {complaint.media.length} attachment(s)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(complaint)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {complaint.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                      )}
                      {['assigned', 'in-progress'].includes(complaint.status) && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsStatusDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedComplaint && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">{selectedComplaint.title}</h4>
                <p className="text-sm text-slate-600 line-clamp-2">{selectedComplaint.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={assignmentData.department} 
                  onValueChange={(value) => setAssignmentData({...assignmentData, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public Works">Public Works</SelectItem>
                    <SelectItem value="Water Department">Water Department</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Sanitation">Sanitation</SelectItem>
                    <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={assignmentData.priority} 
                  onValueChange={(value) => setAssignmentData({...assignmentData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="note">Assignment Note (Optional)</Label>
              <Textarea
                placeholder="Add any notes or instructions for the assigned department..."
                value={assignmentData.note}
                onChange={(e) => setAssignmentData({...assignmentData, note: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignComplaint} disabled={!assignmentData.department}>
                Assign Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedComplaint && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">{selectedComplaint.title}</h4>
                <p className="text-sm text-slate-600 line-clamp-2">{selectedComplaint.description}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <Badge className={`${getStatusColor(selectedComplaint.status)} border`}>
                    Current: {selectedComplaint.status?.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select 
                value={statusData.status} 
                onValueChange={(value) => setStatusData({...statusData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusNote">Status Update Note</Label>
              <Textarea
                placeholder="Provide details about this status update..."
                value={statusData.note}
                onChange={(e) => setStatusData({...statusData, note: e.target.value})}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={!statusData.status}>
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details View Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Complaint ID</Label>
                  <p className="font-mono text-sm">{selectedComplaint._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Submitted</Label>
                  <p className="text-sm">{formatDate(selectedComplaint.createdAt)}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center space-x-4">
                <Badge className={`${getStatusColor(selectedComplaint.status)} border`}>
                  {selectedComplaint.status?.replace('-', ' ')}
                </Badge>
                <Badge className={`${getPriorityColor(selectedComplaint.priority)} border`}>
                  {selectedComplaint.priority} priority
                </Badge>
              </div>

              {/* Title and Description */}
              <div>
                <Label className="text-sm font-medium text-slate-600">Title</Label>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">{selectedComplaint.title}</h3>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-600">Description</Label>
                <p className="text-slate-700 mt-1 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {/* Location and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Location</Label>
                  <p className="text-sm text-slate-700">{selectedComplaint.location?.address || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Submitted By</Label>
                  <p className="text-sm text-slate-700">{selectedComplaint.submittedBy?.name || 'Anonymous'}</p>
                </div>
              </div>

              {/* Assignment Info */}
              {selectedComplaint.assignedTo && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Assigned To</Label>
                  <p className="text-sm text-slate-700">{selectedComplaint.assignedTo.name}</p>
                </div>
              )}

              {/* Media Attachments */}
              {selectedComplaint.media?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Attachments</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {selectedComplaint.media.map((mediaItem: any, index: number) => (
                      <div key={index} className="border rounded-lg p-2 text-center">
                        <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 truncate">{mediaItem.filename || `attachment-${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Log */}
              {selectedComplaint.statusHistory?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Activity Log</Label>
                  <div className="mt-2 space-y-2">
                    {selectedComplaint.statusHistory.map((activity: any, index: number) => (
                      <div key={index} className="border-l-2 border-slate-200 pl-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        {activity.note && (
                          <p className="text-sm text-slate-600 mt-1">{activity.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintManagement;
