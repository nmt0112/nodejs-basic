const { check } = require('express-validator');
const { authenticateToken, secretKey } = require('../helper/CheckAuth');

module.exports = {
    UserValidator: function () {
        return [
            check('email', 'Email phải đúng định dạng').isEmail(),
            check('password').custom((value, { req }) => {
                if (req.body.password) {
                    if (!validateStrongPassword(value)) {
                        throw new Error('Password phải chứa ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
                    }
                }
                return true;
            })
        ];
    },
    emailValidator: function () {
        return [
            check('email', 'Email phải đúng định dạng').isEmail()
        ];
    },
    ChangePassValidator: function () {
        return [
            check('password').custom((value, { req }) => {
                if (req.body.resetPassword) {
                    if (!validateStrongPassword(value)) {
                        throw new Error('Password phải chứa ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
                    }
                }
                return true;
            })
        ];
    },
    authenticateToken: authenticateToken,
    secretKey: secretKey
};

function validateStrongPassword(password) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=.*[^\s]).{8,}$/.test(password);
}
