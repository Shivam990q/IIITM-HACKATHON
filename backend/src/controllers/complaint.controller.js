const { validationResult } = require('express-validator');
const Complaint = require('../models/complaint.model');

/**
 * Create a new complaint
 * @route POST /api/complaints
 * @access Private
 */
exports.createComplaint = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    const { title, description, category, address } = req.body;
    const { lat, lng } = req.body.location || {};
    
    // Process images if any
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Generate a mock blockchain hash (in a real app, this would interact with blockchain)
    const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Create complaint document
    const complaint = await Complaint.create({
      title,
      description,
      category,
      location: {
        coordinates: [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
        address,
      },
      images,
      submittedBy: req.user._id,
      transactionHash: mockTransactionHash,
      blockchainTimestamp: new Date(),
      statusUpdates: [
        {
          status: 'pending',
          updatedBy: req.user._id,
          note: 'Complaint submitted and recorded on blockchain',
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: {
        complaint,
        transactionHash: mockTransactionHash,
      },
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating complaint',
    });
  }
};

/**
 * Get all complaints
 * @route GET /api/complaints
 * @access Public
 */
exports.getComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      sort = '-createdAt',
    } = req.query;

    const queryObj = {};

    // Add filters
    if (status) queryObj.status = status;
    if (category) queryObj.category = category;

    // Add location-based query if coordinates provided
    if (req.query.lat && req.query.lng && req.query.radius) {
      const { lat, lng, radius } = req.query;
      queryObj.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius) * 1000, // Convert km to meters
        },
      };
    }

    // Count total documents
    const total = await Complaint.countDocuments(queryObj);

    // Execute query with pagination
    const complaints = await Complaint.find(queryObj)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('submittedBy', 'name')
      .populate('assignedTo', 'name role');

    res.status(200).json({
      status: 'success',
      results: complaints.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      data: {
        complaints,
      },
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching complaints',
    });
  }
};

/**
 * Get a single complaint by ID
 * @route GET /api/complaints/:id
 * @access Public
 */
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name')
      .populate('assignedTo', 'name role')
      .populate('comments.user', 'name role')
      .populate('statusUpdates.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        complaint,
      },
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching complaint',
    });
  }
};

/**
 * Update a complaint status
 * @route PATCH /api/complaints/:id/status
 * @access Private (Admin, Official)
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found',
      });
    }

    // Update status
    complaint.status = status;

    // Add status update to history
    complaint.statusUpdates.push({
      status,
      updatedBy: req.user._id,
      note: note || `Status updated to ${status}`,
    });

    // Calculate resolution time if status is 'resolved'
    if (status === 'resolved') {
      const creationTime = new Date(complaint.createdAt).getTime();
      const resolutionTime = new Date().getTime();
      complaint.resolutionTime = Math.round((resolutionTime - creationTime) / (1000 * 60 * 60)); // In hours
    }

    await complaint.save();

    res.status(200).json({
      status: 'success',
      data: {
        complaint,
      },
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating complaint status',
    });
  }
};

/**
 * Add a comment to a complaint
 * @route POST /api/complaints/:id/comments
 * @access Private
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found',
      });
    }

    // Add comment
    complaint.comments.push({
      text,
      user: req.user._id,
      role: req.user.role,
    });

    await complaint.save();

    // Return the updated complaint with populated user fields
    const updatedComplaint = await Complaint.findById(id)
      .populate('comments.user', 'name')
      .populate('statusUpdates.updatedBy', 'name role');

    res.status(200).json({
      status: 'success',
      data: {
        complaint: updatedComplaint,
      },
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while adding comment',
    });
  }
};

/**
 * Assign complaint to official
 * @route PATCH /api/complaints/:id/assign
 * @access Private (Admin)
 */
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { officialId, department, priority } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found',
      });
    }

    // Update assignment details
    complaint.assignedTo = officialId;
    complaint.department = department;
    if (priority) complaint.priority = priority;

    // Update status if it's still pending
    if (complaint.status === 'pending') {
      complaint.status = 'acknowledged';
      complaint.statusUpdates.push({
        status: 'acknowledged',
        updatedBy: req.user._id,
        note: `Assigned to department: ${department}`,
      });
    }

    await complaint.save();

    res.status(200).json({
      status: 'success',
      data: {
        complaint,
      },
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while assigning complaint',
    });
  }
};

/**
 * Upvote a complaint
 * @route POST /api/complaints/:id/upvote
 * @access Private
 */
exports.upvoteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'Complaint not found',
      });
    }

    // Check if already upvoted
    const alreadyUpvoted = complaint.upvotes.some(
      (upvoteId) => upvoteId.toString() === userId.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote (toggle)
      complaint.upvotes = complaint.upvotes.filter(
        (upvoteId) => upvoteId.toString() !== userId.toString()
      );
    } else {
      // Add upvote
      complaint.upvotes.push(userId);
    }

    await complaint.save();

    res.status(200).json({
      status: 'success',
      data: {
        upvotes: complaint.upvotes.length,
        hasUpvoted: !alreadyUpvoted,
      },
    });
  } catch (error) {
    console.error('Upvote complaint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while processing upvote',
    });
  }
}; 