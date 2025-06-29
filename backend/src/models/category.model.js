const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'FileText',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
categorySchema.index({ isActive: 1, order: 1 });

// Static method to get active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method to initialize default categories
categorySchema.statics.initializeDefaultCategories = async function() {
  const count = await this.countDocuments();
  
  if (count === 0) {
    const defaultCategories = [
      {
        name: 'Road & Infrastructure',
        description: 'Issues related to roads, bridges, and infrastructure',
        icon: 'Construction',
        color: '#8b5cf6',
        order: 1,
      },
      {
        name: 'Water Supply',
        description: 'Water related complaints and issues',
        icon: 'Droplets',
        color: '#06b6d4',
        order: 2,
      },
      {
        name: 'Electricity',
        description: 'Power outages and electrical issues',
        icon: 'Zap',
        color: '#eab308',
        order: 3,
      },
      {
        name: 'Waste Management',
        description: 'Garbage collection and waste disposal',
        icon: 'Trash2',
        color: '#10b981',
        order: 4,
      },
      {
        name: 'Street Lighting',
        description: 'Street light maintenance and issues',
        icon: 'Lightbulb',
        color: '#f59e0b',
        order: 5,
      },
      {
        name: 'Public Safety',
        description: 'Safety and security related concerns',
        icon: 'Shield',
        color: '#dc2626',
        order: 6,
      },
      {
        name: 'Parks & Recreation',
        description: 'Parks, playgrounds and recreational facilities',
        icon: 'Trees',
        color: '#059669',
        order: 7,
      },
      {
        name: 'Traffic & Transportation',
        description: 'Traffic signals, public transport issues',
        icon: 'Car',
        color: '#7c3aed',
        order: 8,
      },
      {
        name: 'Healthcare',
        description: 'Public health and medical facility issues',
        icon: 'Heart',
        color: '#e11d48',
        order: 9,
      },
      {
        name: 'Education',
        description: 'Schools and educational facility issues',
        icon: 'GraduationCap',
        color: '#2563eb',
        order: 10,
      },
    ];

    await this.insertMany(defaultCategories);
    console.log('Default categories initialized successfully');
  }
};

module.exports = mongoose.model('Category', categorySchema);
