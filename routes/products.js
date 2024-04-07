var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var productModel = require('../schemas/product');
var brandModel = require('../schemas/brand');
var categoryModel = require('../schemas/category');
const brand = require('../schemas/brand');
const category = require('../schemas/category');

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
    var products = await productModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .exec();
    responseReturn.ResponseSend(res, true, 200, products)
});

router.get('/:id', async function (req, res, next) {
    try {
        let product = await productModel.find({ _id: req.params.id });
        responseReturn.ResponseSend(res, true, 200, product)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.post('/', async function (req, res, next) {
    try {
        var newproduct = new productModel({
            name: req.body.name,
            price: req.body.price,
            brand: req.body.brand,
            category: req.body.category
        })
        await newproduct.save();
        console.log(newproduct);
        var brand = await brandModel.findByID(req.body.brand).exec();
        brand.pushlished.push(newproduct);

        var category = await categoryModel.findByID(req.body.category).exec();
        category.pushlished.push(newproduct);

        responseReturn.ResponseSend(res, true, 200, newproduct)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        let product = await productModel.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true
            });
        responseReturn.ResponseSend(res, true, 200, product)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})
router.delete('/:id', async function (req, res, next) {
    try {
        let product = await productModel.findByIdAndUpdate(req.params.id, {
            isDelete: true
        }, {
            new: true
        });
        responseReturn.ResponseSend(res, true, 200, product)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

module.exports = router;