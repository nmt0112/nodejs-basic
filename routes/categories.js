var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var categoryModel = require('../schemas/category');

router.get('/', async function (req, res, next) {
    var queries = {};
    var arrayExclude = ["limit", "sort", "page"];
    for (const [key, value] of Object.entries(req.query)) {
        if (!arrayExclude.includes(key)) {
            queries[key] = new RegExp(value, 'i');
        }
    }
    queries.isDelete = false;
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 5;
    var sort = req.query.sort ? req.query.sort : {}
    var categorys = await categoryModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .populate('published')
        .exec();
    responseReturn.ResponseSend(res, true, 200, categorys)
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

router.post('/', async function (req, res, next) {
    try {
        var newcategory = new categoryModel({
            name: req.body.name
        })
        await newcategory.save();
        responseReturn.ResponseSend(res, true, 200, newcategory)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

router.put('/:id', async function (req, res, next) {
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
router.delete('/:id', async function (req, res, next) {
    try {
        let category = await categoryModel.findByIdAndUpdate(req.params.id, {
            isDelete: true
        }, {
            new: true
        });
        responseReturn.ResponseSend(res, true, 200, category)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

module.exports = router;
