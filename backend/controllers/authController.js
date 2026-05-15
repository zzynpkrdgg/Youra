const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const testAuth = (req, res) => {
    res.json({
        message: "Auth controller çalışıyor"
    })
}

const registerUser = async (req, res) => {

    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Tüm alanlar zorunludur"
        })
    }

    if (!email.includes("@")) {
        return res.status(400).json({
            message: "Geçerli bir email giriniz"
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Şifre en az 6 karakter olmalıdır"
        })
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 10)

    res.status(201).json({
        message: "Kullanıcı başarıyla kayıt edildi",
        user: {
            username,
            email,
            password: hashedPassword
        }
    })
}

const loginUser = async (req, res) => {

    const { email, password } = req.body

    // Fake kullanıcı
    const fakeUser = {
        id: "12345",
        username: "bahar",
        email: "bahar@gmail.com",
        password: await bcrypt.hash("123456", 10)
    }

    // Email kontrolü
    if (email !== fakeUser.email) {
        return res.status(400).json({
            message: "Email bulunamadı"
        })
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, fakeUser.password)

    if (!isMatch) {
        return res.status(400).json({
            message: "Şifre yanlış"
        })
    }

    // JWT token oluştur
    const token = jwt.sign(
        {
            id: fakeUser.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    res.status(200).json({
        message: "Giriş başarılı",
        token
    })
}

module.exports = {
    testAuth,
    registerUser,
    loginUser
}

