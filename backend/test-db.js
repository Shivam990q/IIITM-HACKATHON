#!/usr/bin/env node
/**
 * MongoDB Connection Test Script
 * Run this to test if your MongoDB connection is working
 * Usage: node test-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🧪 Testing MongoDB Connection...');
console.log('📍 Connection string:', MONGODB_URI?.replace(/\/\/[^@]+@/, '//***:***@') || 'Not set');

if (!MONGODB_URI || MONGODB_URI.includes('replace-with-your-connection-string')) {
  console.log('❌ MongoDB URI not configured properly');
  console.log('💡 Please update MONGODB_URI in your .env file');
  console.log('');
  console.log('📋 Quick setup instructions:');
  console.log('1. Go to https://www.mongodb.com/atlas');
  console.log('2. Create free account and cluster');
  console.log('3. Get connection string');
  console.log('4. Update .env file with your connection string');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database info:');
    console.log('  - Database name:', mongoose.connection.db.databaseName);
    console.log('  - Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    // Test creating a simple document
    console.log('');
    console.log('🧪 Testing database operations...');
    
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = { message: 'Test successful', timestamp: new Date() };
    
    await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful');
    
    const result = await testCollection.findOne({ message: 'Test successful' });
    console.log('✅ Read operation successful');
    
    // Clean up
    await testCollection.deleteOne({ message: 'Test successful' });
    console.log('✅ Delete operation successful');
    
    console.log('');
    console.log('🎉 All database tests passed!');
    console.log('🚀 Your application is ready to run');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('   Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the connection string');
    } else if (error.message.includes('IP not whitelisted')) {
      console.log('💡 Add your IP address to MongoDB Atlas whitelist');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your internet connection and cluster URL');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();
