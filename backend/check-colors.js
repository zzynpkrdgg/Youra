require('dotenv').config();
const mongoose = require('mongoose');
const Clothing = require('./models/clothing');
const connectDB = require('./config/db');

async function testColors() {
  await connectDB();
  const clothes = await Clothing.find({}, 'color').limit(20).lean();
  console.log('Colors in DB:');
  clothes.forEach(c => console.log(c.color));
  process.exit(0);
}

testColors();
