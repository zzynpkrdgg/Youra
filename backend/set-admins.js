require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

async function fixAdmins() {
  await connectDB();
  const res = await User.updateMany(
    { email: { $in: ['tolga@tolga.com', 'zey@gmail.com'] } },
    { $set: { role: 'admin' } }
  );
  console.log('Updated admins:', res);
  process.exit(0);
}

fixAdmins();
