const mongoose = require('mongoose');
const User = require('./models/User');

async function quickTest() {
    try {
        const uri = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
        await mongoose.connect(uri);
        
        const admin = await User.findOne({ email: 'admin@studentlibrary.com' });
        
        if (admin) {
            console.log('ADMIN FOUND:', admin.email, admin.role);
        } else {
            console.log('NO ADMIN FOUND');
            const users = await User.find({});
            console.log('ALL USERS:', users.length);
            users.forEach(u => console.log(' -', u.email, u.role));
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.log('ERROR:', err.message);
    }
}

quickTest();
