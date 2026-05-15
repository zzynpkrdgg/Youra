const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log("⚠️ MONGO_URI .env dosyasında bulunamadı. Veritabanı bağlantısı atlanıyor.");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB bağlantısı başarılı!");
    } catch (error) {
        console.error("❌ MongoDB bağlantı hatası:", error);
        // Bağlantı zorunluysa process.exit(1) yapılabilir
    }
};

module.exports = connectDB;
