const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const testAuth = (req, res) => {
    res.json({
        message: "Auth controller çalışıyor"
    })
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body

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

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                message: "Bu email zaten kayıtlı"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            message: "Kullanıcı başarıyla kayıt edildi",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email ve şifre zorunludur"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Email bulunamadı"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                message: "Şifre yanlış"
            })
        }

        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        res.status(200).json({
            message: "Giriş başarılı",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

module.exports = {
    testAuth,
    registerUser,
    loginUser
}