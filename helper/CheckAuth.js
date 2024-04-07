const jwt = require('jsonwebtoken');
const userModel = require('../schemas/user');

const secretKey = '20DTHB1';

async function authenticateToken(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
        }

        const decodedToken = jwt.verify(token, secretKey);
        const user = await userModel.findById(decodedToken.userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}

module.exports = {
    authenticateToken: authenticateToken,
    secretKey: secretKey
};
