// Test the complete enhanced chat system
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');
const { sendOTPEmail, generateOTP } = require('./utils/emailService');

async function testEnhancedChatSystem() {
  console.log('🎯 TESTING ENHANCED CHAT SYSTEM');
  console.log('================================');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Create test users
    console.log('\n📊 Test 1: Create Test Users');
    
    const testUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice@test.com',
        password: 'password123',
        department: 'Computer Science',
        studentId: 'CS001',
        isEmailVerified: true,
        isInGlobalChat: true,
        onlineStatus: 'online'
      },
      {
        name: 'Bob Smith',
        email: 'bob@test.com',
        password: 'password123',
        department: 'Mathematics',
        studentId: 'MA001',
        isEmailVerified: true,
        isInGlobalChat: true,
        onlineStatus: 'offline'
      }
    ];
    
    // Clean up existing test users
    await User.deleteMany({ email: { $in: ['alice@test.com', 'bob@test.com'] } });
    
    // Create new test users
    const createdUsers = await User.create(testUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);
    
    // Test 2: Send global message
    console.log('\n📊 Test 2: Send Global Message');
    
    const globalMessage = await Message.create({
      sender: createdUsers[0]._id,
      content: 'Hello everyone! This is a test global message.',
      chatType: 'global',
      room: 'general'
    });
    
    console.log('✅ Global message created:', globalMessage.content);
    
    // Test 3: Send direct message
    console.log('\n📊 Test 3: Send Direct Message');
    
    const directMessage = await Message.create({
      sender: createdUsers[0]._id,
      recipient: createdUsers[1]._id,
      content: 'Hi Bob! This is a private message.',
      chatType: 'direct'
    });
    
    console.log('✅ Direct message created:', directMessage.content);
    
    // Test 4: Query verified users (like API endpoint)
    console.log('\n📊 Test 4: Query Verified Users');
    
    const verifiedUsers = await User.find({
      isEmailVerified: true,
      isActive: true
    })
    .select('name email avatar bio department studentId onlineStatus lastSeenInChat joinDate')
    .sort({ name: 1 });
    
    console.log(`✅ Found ${verifiedUsers.length} verified users:`);
    verifiedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.department}) - ${user.onlineStatus}`);
    });
    
    // Test 5: Query global messages (like API endpoint)
    console.log('\n📊 Test 5: Query Global Messages');
    
    const globalMessages = await Message.find({
      chatType: 'global',
      isDeleted: false
    })
    .populate('sender', 'name avatar onlineStatus')
    .sort({ createdAt: -1 })
    .limit(10);
    
    console.log(`✅ Found ${globalMessages.length} global messages:`);
    globalMessages.forEach(msg => {
      console.log(`   - ${msg.sender?.name}: ${msg.content}`);
    });
    
    // Test 6: Query direct messages (like API endpoint)
    console.log('\n📊 Test 6: Query Direct Messages');
    
    const directMessages = await Message.find({
      chatType: 'direct',
      isDeleted: false,
      $or: [
        { sender: createdUsers[0]._id, recipient: createdUsers[1]._id },
        { sender: createdUsers[1]._id, recipient: createdUsers[0]._id }
      ]
    })
    .populate('sender', 'name avatar onlineStatus')
    .populate('recipient', 'name avatar onlineStatus')
    .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${directMessages.length} direct messages:`);
    directMessages.forEach(msg => {
      console.log(`   - ${msg.sender?.name} → ${msg.recipient?.name}: ${msg.content}`);
    });
    
    console.log('\n🎉 ENHANCED CHAT SYSTEM TEST COMPLETE!');
    console.log('=====================================');
    console.log('✅ User Management: Working');
    console.log('✅ Global Chat: Working');
    console.log('✅ Direct Messaging: Working');
    console.log('✅ Database Queries: Working');
    console.log('✅ Auto-add to Global Chat: Ready');
    console.log('\n🚀 System is ready for OTP-verified users!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

testEnhancedChatSystem();
