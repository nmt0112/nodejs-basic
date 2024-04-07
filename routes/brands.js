var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var brandModel = require('../schemas/brand');

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
    var brands = await brandModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .populate('published')
        .exec();
    responseReturn.ResponseSend(res, true, 200, brands)
});

router.get('/:id', async function (req, res, next) {
    try {
        let brand = await brandModel.find({ _id: req.params.id }).populate({
            path: 'published',
            select: '-isDelete -createdAt -updatedAt'
        });
        responseReturn.ResponseSend(res, true, 200, brand)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.post('/', async function (req, res, next) {
    try {
        var newbrand = new brandModel({
            name: req.body.name
        })
        await newbrand.save();
        responseReturn.ResponseSend(res, true, 200, newbrand)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        let brand = await brandModel.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true
            });
        responseReturn.ResponseSend(res, true, 200, brand)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})
router.delete('/:id', async function (req, res, next) {
    try {
        let brand = await brandModel.findByIdAndUpdate(req.params.id, {
            isDelete: true
        }, {
            new: true
        });
        responseReturn.ResponseSend(res, true, 200, brand)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

module.exports = router;
