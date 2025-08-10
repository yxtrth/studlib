const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');
const Video = require('./models/Video');

async function testRenderURI() {
    console.log('🔍 TESTING YOUR RENDER MONGODB URI');
    console.log('=====================================');
    
    // This is the exact URI you said you have on Render
    const renderURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    console.log('📡 Testing Render URI (WITHOUT database name):');
    console.log('   URI:', renderURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    try {
        await mongoose.connect(renderURI);
        console.log('✅ Connection successful');
        
        // Check what's in this database
        const adminUser = await User.findOne({ role: 'admin' });
        const bookCount = await Book.countDocuments();
        const videoCount = await Video.countDocuments();
        
        console.log('\n📊 Database Contents:');
        if (adminUser) {
            console.log('✅ Admin user found');
            console.log('   👤 Name:', adminUser.name);
            console.log('   📧 Email:', adminUser.email);
            console.log('   🔐 Role:', adminUser.role);
        } else {
            console.log('❌ NO ADMIN USER FOUND');
        }
        
        console.log('📚 Books:', bookCount);
        console.log('🎥 Videos:', videoCount);
        
        if (adminUser && bookCount > 0 && videoCount > 0) {
            console.log('\n✅ This database has everything! Login should work.');
        } else {
            console.log('\n❌ This database is missing content! This is why login fails.');
        }
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🔍 TESTING CORRECT URI (WITH database name):');
    
    // This is what the URI should be
    const correctURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    console.log('📡 Testing Correct URI (WITH /student-library):');
    console.log('   URI:', correctURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    try {
        await mongoose.connect(correctURI);
        console.log('✅ Connection successful');
        
        // Check what's in this database
        const adminUser = await User.findOne({ role: 'admin' });
        const bookCount = await Book.countDocuments();
        const videoCount = await Video.countDocuments();
        
        console.log('\n📊 Database Contents:');
        if (adminUser) {
            console.log('✅ Admin user found');
            console.log('   👤 Name:', adminUser.name);
            console.log('   📧 Email:', adminUser.email);
            console.log('   🔐 Role:', adminUser.role);
        } else {
            console.log('❌ NO ADMIN USER FOUND');
        }
        
        console.log('📚 Books:', bookCount);
        console.log('🎥 Videos:', videoCount);
        
        if (adminUser && bookCount > 0 && videoCount > 0) {
            console.log('\n✅ This database has everything! Login should work.');
        } else {
            console.log('\n❌ This database is missing content!');
        }
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
    
    console.log('\n🎯 SOLUTION:');
    console.log('Update your Render MONGODB_URI to:');
    console.log('mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE');
    console.log('\n🔧 Steps:');
    console.log('1. Go to your Render dashboard');
    console.log('2. Open your backend service');
    console.log('3. Go to Environment variables');
    console.log('4. Edit MONGODB_URI');
    console.log('5. Add "/student-library" after .mongodb.net');
    console.log('6. Save and redeploy');
}

testRenderURI().catch(console.error);
