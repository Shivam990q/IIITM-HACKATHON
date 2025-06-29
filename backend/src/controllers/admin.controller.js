const User = require('../models/user.model');
const Complaint = require('../models/complaint.model');

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/stats
 * @access Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user statistics by role
    const userStats = await User.getAdminStats();
    
    // Get complaint statistics
    const complaintStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCitizens = await User.countDocuments({ role: 'citizen' });

    res.status(200).json({
      status: 'success',
      data: {
        userStats,
        complaintStats,
        recentComplaints,
        totals: {
          users: totalUsers,
          complaints: totalComplaints,
          admins: totalAdmins,
          citizens: totalCitizens
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admin statistics'
    });
  }
};

/**
 * Get all users (admin view)
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = role ? { role } : {};
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
};

/**
 * Get all complaints (admin view)
 * @route GET /api/admin/complaints
 * @access Private (Admin only)
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
      const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        complaints,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching complaints'
    });
  }
};

/**
 * Update user role and permissions
 * @route PUT /api/admin/users/:id/role
 * @access Private (Admin only)
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Update role and metadata
    user.role = role;
    if (permissions) {
      user.roleMetadata.permissions = permissions;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating user role'
    });
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Don't allow deletion of super admins
    if (user.role === 'admin' && user.roleMetadata.adminLevel === 'super_admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Cannot delete super admin user'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting user'
    });
  }
};

/**
 * Assign complaint to a specific official/department (admin)
 * @route PATCH /api/admin/complaints/:id/assign
 * @access Private (Admin only)
 */
exports.assignComplaintToOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const { officialId, department, priority, note } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found'
      });
    }

    // Update assignment details
    complaint.assignedTo = officialId;
    complaint.department = department;
    if (priority) complaint.priority = priority;

    // Update status to acknowledged when assigned
    if (complaint.status === 'pending') {
      complaint.status = 'acknowledged';
    }

    // Add status update entry
    complaint.statusUpdates.push({
      status: complaint.status,
      updatedBy: req.user._id,
      note: note || `Assigned to ${department}${officialId ? ' official' : ''}`,
    });

    await complaint.save();

    // Populate the updated complaint
    const updatedComplaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email role')
      .populate('statusUpdates.updatedBy', 'name role');

    res.status(200).json({
      status: 'success',
      data: {
        complaint: updatedComplaint,
      },
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error assigning complaint'
    });
  }
};

/**
 * Update complaint status (admin)
 * @route PATCH /api/admin/complaints/:id/status
 * @access Private (Admin only)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    // Add status update entry
    complaint.statusUpdates.push({
      status,
      updatedBy: req.user._id,
      note: note || `Status updated from ${oldStatus} to ${status}`,
    });

    // Calculate resolution time if status is 'resolved'
    if (status === 'resolved') {
      const creationTime = new Date(complaint.createdAt).getTime();
      const resolutionTime = new Date().getTime();
      complaint.resolutionTime = Math.round((resolutionTime - creationTime) / (1000 * 60 * 60)); // In hours
    }

    await complaint.save();

    // Populate the updated complaint
    const updatedComplaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email role')
      .populate('statusUpdates.updatedBy', 'name role');

    res.status(200).json({
      status: 'success',
      data: {
        complaint: updatedComplaint,
      },
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating complaint status'
    });
  }
};

/**
 * Get complaint details with full information (admin)
 * @route GET /api/admin/complaints/:id
 * @access Private (Admin only)
 */
exports.getComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('category', 'name description')
      .populate('comments.user', 'name role')
      .populate('statusUpdates.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        complaint,
      },
    });
  } catch (error) {
    console.error('Get complaint details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching complaint details'
    });
  }
};
