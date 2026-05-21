const mongoose = require('mongoose');
require('dotenv').config();
const Clothing = require('./models/clothing');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const clothes = await Clothing.find().sort({ createdAt: -1 }).limit(5);
    console.log(clothes);
    process.exit(0);
}
check();
