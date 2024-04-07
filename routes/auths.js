const express = require('express');
const router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
const userModel = require('../schemas/user');
var bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
var validator = require('../validators/user')
const { authenticateToken, secretKey } = require('../helper/CheckAuth');

router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: Date.now(24 * 60 * 60 * 1000) });

        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: 'Đăng nhập thành công', user: { username: user.username, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập' });
    }
});

router.post('/logout', function (req, res) {
    res.clearCookie('token');
    // res.cookie('token', '', { expires: new Date(0) });
    res.status(200).json({ message: 'Đã đăng xuất thành công' });
});

router.post('/change-password', authenticateToken, validator.ChangePassValidator(), async function (req, res, next) {

    const token = req.cookies.token;

    var errors = validationResult(req).errors;

    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);

        const user = await userModel.findByIdAndUpdate(
            decodedToken.userId,
            { password: req.body.restPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        await user.save();
        return res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công' });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
});


module.exports = router;
