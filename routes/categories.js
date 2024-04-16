var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var categoryModel = require('../schemas/category');
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/protect');

router.get('/', async function (req, res, next) {
    var queries = {};
    var arrayExclude = ["limit", "sort", "page"];
    for (const [key, value] of Object.entries(req.query)) {
        if (!arrayExclude.includes(key)) {
            queries[key] = new RegExp(value, 'i');
        }
    }
    if (checkRole) {
        queries.isDelete
    } else {
        queries.isDelete = false
    }
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 5;
    var sort = req.query.sort ? req.query.sort : {}
    var totalCategories = await categoryModel.countDocuments(queries);
    var categories = await categoryModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .populate('published')
        .exec();
    responseReturn.ResponseSend(res, true, 200, { categories, totalCategories })
});

router.get('/:id', async function (req, res, next) {
    try {
        let category = await categoryModel.find({ _id: req.params.id }).populate({
            path: 'published',
            select: '-isDelete -createdAt -updatedAt'
        });
        responseReturn.ResponseSend(res, true, 200, category)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.post('/', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        var newcategory = new categoryModel({
            name: req.body.name
        });
        await newcategory.save();
        responseReturn.ResponseSend(res, true, 200, newcategory)
    } catch (error) {
        console.log(error);
        responseReturn.ResponseSend(res, true, 404, error)
    }
})


router.put('/:id', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let category = await categoryModel.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true
            });
        responseReturn.ResponseSend(res, true, 200, category)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})
router.delete('/:id', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let category = await categoryModel.findById(req.params.id);
        if (!category) {
            return responseReturn.ResponseSend(res, false, 404, 'Brand not found');
        }
        category.isDelete = !category.isDelete;
        await category.save();
        responseReturn.ResponseSend(res, true, 200, category);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error.message);
    }
})

module.exports = router;
