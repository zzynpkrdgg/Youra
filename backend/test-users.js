const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');
const Clothing = require('./models/clothing');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find();
    console.log("Users:", users.map(u => ({ id: u._id, email: u.email })));
    const clothes = await Clothing.find();
    console.log("Clothes count per user:", clothes.reduce((acc, c) => {
        acc[c.user] = (acc[c.user] || 0) + 1;
        return acc;
    }, {}));
    process.exit(0);
}
check();
