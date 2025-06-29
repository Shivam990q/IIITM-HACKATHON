const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'official'],
    default: 'citizen',
    required: true,
    index: true, // Add index for role-based queries
  },
  // Role-specific metadata
  roleMetadata: {
    // For Admin users
    adminLevel: {
      type: String,
      enum: ['super_admin', 'regional_admin', 'local_admin'],
      default: 'local_admin',
    },
    department: {
      type: String,
      default: '',
    },
    jurisdiction: {
      type: String,
      default: '',
    },
    // For Citizen users
    citizenId: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    // Common fields
    permissions: [{
      type: String,
      enum: ['read', 'write', 'delete', 'manage_users', 'manage_complaints', 'view_analytics'],
    }],
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is correct
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Role-based methods
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.isCitizen = function() {
  return this.role === 'citizen';
};

userSchema.methods.hasPermission = function(permission) {
  return this.roleMetadata.permissions.includes(permission);
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role });
};

// Static method to get admin statistics
userSchema.statics.getAdminStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        verified: {
          $sum: {
            $cond: [{ $eq: ['$roleMetadata.verificationStatus', 'verified'] }, 1, 0]
          }
        }
      }
    }
  ]);
  return stats;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 