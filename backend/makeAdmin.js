const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config({ path: './.env' });

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = process.argv[2];
        if (!email) {
            console.log("Kullanımı: node makeAdmin.js <email>");
            process.exit(1);
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log("Kullanıcı bulunamadı.");
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`${user.username} (${user.email}) artık ADMIN!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

makeAdmin();
