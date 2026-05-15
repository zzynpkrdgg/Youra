const jwt = require("jsonwebtoken")

const protect = (req, res, next) => {

    let token

    // Authorization header kontrol
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {

        try {

            // Token al
            token = req.headers.authorization.split(" ")[1]

            // Token doğrula
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            )

            // Kullanıcı bilgisini request'e ekle
            req.user = decoded

            next()

        } catch (error) {

            return res.status(401).json({
                message: "Yetkisiz erişim"
            })
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Token bulunamadı"
        })
    }
}

module.exports = {
    protect
}