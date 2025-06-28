require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const adminExists = await User.findOne({ email: 'admin@nyaychain.com' });
      
      if (adminExists) {
        console.log('Admin user already exists');
      } else {
        // Create admin user
        const admin = new User({
          name: 'System Administrator',
          email: 'admin@nyaychain.com',
          password: await bcrypt.hash('admin123', 10), // Change this to a secure password in production
          role: 'admin'
        });
        
        await admin.save();
        console.log('Admin user created successfully');
      }
      
      // Check if test citizen user already exists
      const testUserExists = await User.findOne({ email: 'test@example.com' });
      
      if (testUserExists) {
        console.log('Test citizen user already exists');
      } else {
        // Create test citizen user
        const testUser = new User({
          name: 'Test User',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10), // Simple password for testing
          role: 'citizen'
        });
        
        await testUser.save();
        console.log('Test citizen user created successfully');
      }
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      console.error('Error creating users:', error);
      await mongoose.disconnect();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 