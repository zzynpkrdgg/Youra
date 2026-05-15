const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const testAuth = (req, res) => {
    res.json({
        message: "Auth controller çalışıyor"
    })
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tüm alanlar zorunludur" });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ message: "Geçerli bir email giriniz" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Bu email zaten kullanımda" });
        }

        // Şifre hashleme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in DB
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "Kullanıcı başarıyla kayıt edildi",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                style_preferences: user.style_preferences
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in DB
        const user = await User.findOne({ email });

        // Email kontrolü
        if (!user) {
            return res.status(400).json({
                message: "Kullanıcı bulunamadı (Email hatalı)"
            });
        }

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Şifre yanlış"
            });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Giriş başarılı",
            token,
            // Frontend'in yönlendirme yapabilmesi için 'user' objesi ZORUNLU!
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                style_preferences: user.style_preferences
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
}

module.exports = {
    testAuth,
    registerUser,
    loginUser
}
