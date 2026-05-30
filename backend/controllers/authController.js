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
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
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
            username: name,
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
                name: user.username,
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
                name: user.username,
                email: user.email,
                style_preferences: user.style_preferences
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası oluştu" });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user;

        if (name && name.length > 15) {
            return res.status(400).json({ message: "İsim en fazla 15 karakter olabilir" });
        }

        if (name && name !== user.username) {
            if (user.lastNameChangeAt) {
                const diffTime = Math.abs(new Date() - new Date(user.lastNameChangeAt));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 15) {
                    return res.status(400).json({ message: `İsim değiştirme hakkınız ${15 - diffDays + 1} gün sonra yenilenecektir` });
                }
            }
            user.username = name;
            user.lastNameChangeAt = new Date();
        }

        if (email && email !== user.email) {
            if (!email.includes("@")) {
                return res.status(400).json({ message: "Geçerli bir email giriniz" });
            }
            const User = require("../models/user");
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: "Bu email zaten kullanımda" });
            }
            user.email = email;
        }

        await user.save();

        res.status(200).json({
            message: "Profil güncellendi",
            user: {
                id: user._id,
                name: user.username,
                email: user.email,
                style_preferences: user.style_preferences,
                lastNameChangeAt: user.lastNameChangeAt
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
    loginUser,
    updateProfile
}
