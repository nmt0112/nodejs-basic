var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var userModel = require('../schemas/user');
var validator = require('../validators/user')
const { validationResult } = require('express-validator')

router.get('/', async function (req, res, next) {
    var queries = {};
    var arrayExclude = ["limit", "sort", "page"];
    for (const [key, value] of Object.entries(req.query)) {
        if (!arrayExclude.includes(key)) {
            queries[key] = new RegExp(value, 'i');
        }
    }
    queries.status = false;
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 5;
    var sort = req.query.sort ? req.query.sort : {}
    var users = await userModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .exec();
    responseReturn.ResponseSend(res, true, 200, users)
});

router.get('/:id', async function (req, res, next) {
    try {
        let user = await userModel.find({ _id: req.params.id });
        responseReturn.ResponseSend(res, true, 200, user)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.post('/', validator.UserValidator(), async function (req, res, next) {
    var errors = validationResult(req).errors;

    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }

    try {
        var newuser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            status: req.body.status,
            role: req.body.role
        });
        await newuser.save();
        responseReturn.ResponseSend(res, true, 200, newuser);
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error);
    }
})

router.put('/:id', validator.UserValidator(), async function (req, res, next) {
    try {
        const errors = validationResult(req).errors;

        const user = await userModel.findById(req.params.id);

        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }

        user.username = req.body.username;
        user.email = req.body.email;

        if (req.body.password && req.body.password !== user.password) {
            user.password = req.body.password;
        }

        if (req.body.status && req.body.status !== user.status) {
            user.status = req.body.status;
        } else {
            user.status
        }

        if (req.body.role && req.body.role !== user.role) {
            user.role = req.body.role;
        } else {
            user.role
        }

        await user.save();

        if (!user) {
            return responseReturn.ResponseSend(res, false, 404, "Người dùng không tồn tại");
        }

        responseReturn.ResponseSend(res, true, 200, user);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error);
    }
});


router.delete('/:id', async function (req, res, next) {
    try {
        let user = await userModel.findByIdAndUpdate(req.params.id, {
            status: true
        }, {
            new: true
        });
        responseReturn.ResponseSend(res, true, 200, user)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

module.exports = router;
