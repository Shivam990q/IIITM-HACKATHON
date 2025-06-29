const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'official'],
      required: true,
    },
  },
  { timestamps: true }
);

const statusUpdateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'in_progress', 'resolved', 'rejected'],
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    images: [
      {
        type: String, // URL to image
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    statusUpdates: [statusUpdateSchema],
    comments: [commentSchema],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    transactionHash: {
      type: String, // Blockchain transaction hash
    },
    blockchainTimestamp: {
      type: Date,
    },
    resolutionTime: {
      type: Number, // Time taken to resolve (in hours)
    },
  },
  { timestamps: true }
);

// Create index for geospatial queries
complaintSchema.index({ location: '2dsphere' });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint; 