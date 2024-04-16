var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var ResHelper = require('../helper/ResponseHandle');
var Validator = require('../validators/user');
const { validationResult } = require('express-validator');
const protect = require('../middleware/protect');
const checkRole = require('../middleware/checkRole');

// router.get('/', protect, checkRole("modifier", "admin"),
//     async function (req, res, next) {
//         let users = await userModel.find({}).exec();
//         ResHelper.ResponseSend(res, true, 200, users)
//     });
router.get('/', async function (req, res, next) {
    var queries = {};
    var arrayExclude = ["limit", "sort", "page"];
    for (const [key, value] of Object.entries(req.query)) {
        if (!arrayExclude.includes(key)) {
            queries[key] = new RegExp(value, 'i');
        }
    }
    if (checkRole) {
        queries.status
    } else {
        queries.status = false
    }
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 5;
    var sort = req.query.sort ? req.query.sort : {}
    var totalUsers = await userModel.countDocuments(queries);
    var users = await userModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .exec();
    ResHelper.ResponseSend(res, true, 200, { users, totalUsers })
});

router.get('/:id', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let user = await userModel.find({ _id: req.params.id }).exec();
        ResHelper.ResponseSend(res, true, 200, user)
    } catch (error) {
        ResHelper.ResponseSend(res, false, 404, error)
    }
});

router.post('/', Validator.UserValidate(), protect, checkRole("modifier", "admin"), async function (req, res, next) {
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
            role: req.body.role
        })
        await newUser.save();
        ResHelper.ResponseSend(res, true, 200, newUser)
    } catch (error) {
        ResHelper.ResponseSend(res, false, 404, error)
    }
});
router.put('/:id', async function (req, res, next) {
    try {
        let user = await userModel.findById
            (req.params.id).exec()
        user.email = req.body.email;
        await user.save()
        ResHelper.ResponseSend(res, true, 200, user);
    } catch (error) {
        ResHelper.ResponseSend(res, false, 404, error)
    }
});


router.delete('/:id', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let user = await userModel.findById(req.params.id).exec();
        if (!user) {
            return ResHelper.ResponseSend(res, false, 404, "User not found");
        }

        // Toggle the status field
        user.status = !user.status;

        await user.save();
        ResHelper.ResponseSend(res, true, 200, user);
    } catch (error) {
        ResHelper.ResponseSend(res, false, 500, error);
    }
});


module.exports = router;
