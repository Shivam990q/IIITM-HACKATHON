const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/user.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nyaychain';

/**
 * Migration script to update existing users with role metadata
 */
async function migrateUserRoles() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Starting user role migration...');

    // Update all existing users without roleMetadata
    const usersToUpdate = await User.find({
      $or: [
        { roleMetadata: { $exists: false } },
        { roleMetadata: null },
        { 'roleMetadata.permissions': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${usersToUpdate.length} users to update`);

    for (const user of usersToUpdate) {
      const updateData = {};

      if (user.role === 'admin') {
        updateData.roleMetadata = {
          adminLevel: 'local_admin',
          department: '',
          jurisdiction: '',
          permissions: ['read', 'write', 'delete', 'manage_complaints', 'view_analytics']
        };
      } else if (user.role === 'citizen') {
        updateData.roleMetadata = {
          citizenId: '',
          verificationStatus: 'pending',
          permissions: ['read', 'write']
        };
      } else {
        // For any other roles (officials, etc.)
        updateData.roleMetadata = {
          permissions: ['read', 'write']
        };
      }

      await User.findByIdAndUpdate(user._id, updateData);
      console.log(`✅ Updated user: ${user.email} (${user.role})`);
    }

    console.log('🎉 Migration completed successfully!');

    // Show statistics
    const stats = await User.aggregate([
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

    console.log('\n📊 User Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} users${stat.verified ? ` (${stat.verified} verified)` : ''}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrateUserRoles();
