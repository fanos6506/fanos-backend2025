import mongoose from 'mongoose';

const dbHost = 'localhost';
const dbPort = '27017';
const dbName = 'calisdiary';

// Try connecting without authentication first
const dbUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`;

console.log('Attempting to connect to MongoDB without authentication...');
console.log('Connection URL:', dbUrl);

mongoose.connect(dbUrl, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB');
  return mongoose.connection.db.collection('users').findOne({});
})
.then(user => {
  console.log('Sample user from database:', user ? 'Found' : 'No users in database');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
}); 