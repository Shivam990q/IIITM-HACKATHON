import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { adminService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  Activity,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Eye,
  UserCheck,
  MapPin
} from 'lucide-react';

const AdminDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    department: '',
    priority: '',
    note: ''
  });
  const { toast } = useToast();

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setAdminStats(data);
    } catch (error: any) {
      toast({
        title: "Error fetching admin statistics",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);
    const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminStats();
    setIsRefreshing(false);
    toast({
      title: "Dashboard refreshed",
      description: "Latest data has been loaded successfully",
    });
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

  const handleAssignComplaint = async (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsAssignDialogOpen(true);
  };

  const submitAssignment = async () => {
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
      fetchAdminStats(); // Refresh the data
    } catch (error: any) {
      console.error('Error assigning complaint:', error);
      toast({
        title: "Assignment failed",
        description: error.message || "Could not assign complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-b-green-600 border-t-green-600"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Complaints",
      value: adminStats?.totals?.complaints || "0",
      change: "+12%",
      icon: FileText,
      color: "blue"
    },
    {
      title: "Pending Reviews",
      value: adminStats?.complaintStats?.find((s: any) => s._id === 'pending')?.count || "0",
      change: "-8%",
      icon: Clock,
      color: "orange"
    },
    {
      title: "Resolved Today",
      value: adminStats?.complaintStats?.find((s: any) => s._id === 'resolved')?.count || "0",
      change: "+25%",
      icon: CheckCircle,
      color: "green"
    },    {
      title: "Active Citizens",
      value: adminStats?.totals?.citizens || "0",
      change: "+15%",
      icon: Users,
      color: "purple"
    }
  ];
  const recentComplaints = adminStats?.recentComplaints || [];  const quickActions = [
    {
      icon: FileText,
      title: 'Review Complaints',
      description: 'Review pending complaints',
      gradient: 'from-blue-500 to-blue-600',
      action: () => {
        // Navigate to complaint management or trigger a view change
        toast({
          title: "Opening Complaint Management",
          description: "Redirecting to complaint management section...",
        });
        // In a real app, you would use router navigation here
        // e.g., navigate('/admin/complaints');
      }
    },
    {
      icon: UserCheck,
      title: 'User Management',
      description: 'Manage user accounts',
      gradient: 'from-green-500 to-green-600',
      action: () => {
        toast({
          title: "User Management",
          description: "User management functionality coming soon...",
        });
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Welcome Section */}
      <motion.div
        className="relative bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white overflow-hidden"
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
                Admin Dashboard
              </motion.h1>
              <motion.p 
                className="text-green-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Manage and oversee civic governance operations
              </motion.p>
            </div>
          </div>
          
          <motion.p 
            className="text-lg text-green-100 mb-6 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Monitor complaint resolution, manage users, and ensure transparent governance 
            across all civic issues in your jurisdiction.
          </motion.p>

          {/* Quick Actions */}
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
                >                  <Button
                    variant="secondary"
                    className="justify-start p-4 h-auto w-full bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm transition-all duration-300"
                    onClick={action.action}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{action.title}</div>
                      <div className="text-sm text-green-100">{action.description}</div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <TrendingUp className={`h-3 w-3 text-${stat.color}-600`} />
                        <p className={`text-xs text-${stat.color}-600`}>{stat.change}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Complaints Management */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-1 gap-8"
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
                  <CardTitle className="text-xl">Complaint Management</CardTitle>
                  <CardDescription>Recent complaints requiring attention</CardDescription>
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
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No recent complaints found</p>
                </div>
              ) : (
                recentComplaints.map((complaint: any, index: number) => (
                  <motion.div
                    key={complaint._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {complaint._id?.slice(-6).toUpperCase() || 'N/A'}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(complaint.status)}`}>
                            {complaint.status?.replace('_', ' ') || 'unknown'}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(complaint.priority || 'medium')}`}>
                            {complaint.priority || 'medium'} priority
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">{complaint.title}</h4>
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{complaint.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{complaint.submittedBy?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">
                              {complaint.location?.address || 'Location not specified'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {complaint.category?.name || 'General'}
                          </Badge>
                        </div>
                      </div>                      <div className="flex space-x-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(complaint)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        {complaint.status === 'pending' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAssignComplaint(complaint)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        )}
                        {['assigned', 'in-progress'].includes(complaint.status) && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleViewDetails(complaint)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Update
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>          </CardContent>
        </Card>
      </motion.div>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedComplaint && (
              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                <h4 className="font-medium text-slate-900">{selectedComplaint.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{selectedComplaint.description}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={assignmentData.department}
                onValueChange={(value) => setAssignmentData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public-works">Public Works</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="water-department">Water Department</SelectItem>
                  <SelectItem value="electrical">Electrical Department</SelectItem>
                  <SelectItem value="health">Health Department</SelectItem>
                  <SelectItem value="education">Education Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={assignmentData.priority}
                onValueChange={(value) => setAssignmentData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Assignment Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any special instructions or notes..."
                value={assignmentData.note}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setAssignmentData({ department: '', priority: '', note: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitAssignment}>
                Assign Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {selectedComplaint._id?.slice(-6).toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(selectedComplaint.status)}>
                  {selectedComplaint.status?.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(selectedComplaint.priority || 'medium')}>
                  {selectedComplaint.priority || 'medium'} priority
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  {selectedComplaint.title}
                </h3>
                <p className="text-slate-600">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Submitted by:</span>
                  <p>{selectedComplaint.submittedBy?.name || 'Anonymous'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Category:</span>
                  <p>{selectedComplaint.category?.name || 'General'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Location:</span>
                  <p>{selectedComplaint.location?.address || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Date:</span>
                  <p>{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedComplaint.assignedTo && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">Assigned to:</span>
                  <p className="text-blue-800">{selectedComplaint.assignedTo}</p>
                </div>
              )}

              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div>
                  <span className="font-medium text-slate-700">Attachments:</span>
                  <p className="text-sm text-slate-600">{selectedComplaint.images.length} file(s) attached</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
                {selectedComplaint.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      handleAssignComplaint(selectedComplaint);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Assign Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
