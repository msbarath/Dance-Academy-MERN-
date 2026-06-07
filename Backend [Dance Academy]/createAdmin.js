const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    const hash = await bcrypt.hash('Admin@123', 12);
    const existing = await mongoose.connection.collection('users').findOne({ email: 'admin@danceacademy.com' });
    if (existing) {
        console.log('Admin already exists!');
    } else {
        await mongoose.connection.collection('users').insertOne({
            firstname: 'Admin',
            lastname: 'User',
            email: 'admin@danceacademy.com',
            password: hash,
            role: 'admin',
            createdAt: new Date()
        });
        console.log('Admin created successfully!');
        console.log('Email: admin@danceacademy.com');
        console.log('Password: Admin@123');
    }
    process.exit();
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
