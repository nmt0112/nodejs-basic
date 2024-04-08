const express = require('express');
const router = express.Router();
const userModel = require('../schemas/user');
var bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
var ResHelper = require('../helper/ResponseHandle');
var Validator = require('../validators/user');
var configs = require('../configs/config')
const protect = require('../middleware/protect');
const sendmail = require('../helper/sendmail')

router.get('/me', protect, async function (req, res, next) {
    ResHelper.ResponseSend(res, true, 200, req.user)
});

router.post('/ForgotPassword', async function (req, res, next) {
    let user = await userModel.findOne({
        email: req.body.email
    })
    if (!user) {
        ResHelper.ResponseSend(res, false, 404, "email khong ton tai")
    }
    let token = user.genTokenResetPassword();
    await user.save();
    let url = `http://127.0.0.1:8080/api/v1/auths/ResetPassword/${token}`;
    try {
        await sendmail(user.email, url);
        ResHelper.ResponseSend(res, true, 200, "gui mail thanh cong")
    } catch (error) {
        ResHelper.ResponseSend(res, false, 404, error)
    }
});
router.post('/change-password', async function (req, res, next) {
    const token = req.cookies.token;
    var errors = validationResult(req).errors;
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    try {
        const decodedToken = jwt.verify(token, configs.SECRET_KEY);
        const user = await userModel.findById(decodedToken.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        user.password = req.body.restPassword;
        await user.save();
        return res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công' });
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
});

router.post('/ResetPassword/:token', async function (req, res, next) {
    let user = await userModel.findOne({
        ResetPasswordToken: req.params.token
    })
    if (!user) {
        ResHelper.ResponseSend(res, false, 404, "URL khong dung");
        return;
    }
    if (user.ResetPasswordExp > Date.now()) {
        user.password = req.body.password;
    }
    user.ResetPasswordExp = undefined;
    user.ResetPasswordToken = undefined;
    await user.save();
    ResHelper.ResponseSend(res, true, 200, "Doi password thanh cong")
});

router.post('/logout', async function (req, res, next) {
    res.status(200).cookie('token', "null", {
        expires: new Date(Date.now + 1000),
        httpOnly: true
    }).json({ message: 'Đã đăng xuất thành công' });
});

router.post('/login', async function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password) {
        ResHelper.ResponseSend(res, false, 404, 'username va password phai dien day du');
        return;
    }
    let user = await userModel.findOne({ username: username });
    if (!user) {
        ResHelper.ResponseSend(res, false, 404, 'username hoac password khong dung');
        return;
    }
    var checkpass = bcrypt.compareSync(password, user.password);
    if (checkpass) {
        res.status(200).cookie('token', user.getJWT(), {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true
        }).send({
            success: true,
            data: user.getJWT()
        })
        //ResHelper.ResponseSend(res, true, 200, user.getJWT());
    } else {
        ResHelper.ResponseSend(res, false, 404, 'username hoac password khong dung');
    }
});
router.post('/register', Validator.UserValidate(), async function (req, res, next) {
    var errors = validationResult(req).errors;
    if (errors.length > 0) {
        ResHelper.ResponseSend(res, false, 404, errors);
        return;
    }
    try {
        var newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            role: ['USER']
        })
        await newUser.save();
        ResHelper.ResponseSend(res, true, 200, newUser)
    } catch (error) {
        ResHelper.ResponseSend(res, false, 404, error)
    }
});

module.exports = router;

