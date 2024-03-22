var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var authorModel = require('../schemas/author');

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
    var authors = await authorModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .populate('published')
        .exec();
    responseReturn.ResponseSend(res, true, 200, authors)
});

router.get('/:id', async function (req, res, next) {
    try {
        let author = await authorModel.find({ _id: req.params.id });
        responseReturn.ResponseSend(res, true, 200, author)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.post('/', async function (req, res, next) {
    try {
        var newauthor = new authorModel({
            name: req.body.name
        })
        await newauthor.save();
        responseReturn.ResponseSend(res, true, 200, newauthor)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        let author = await authorModel.findByIdAndUpdate(req.params.id, req.body,
            {
                new: true
            });
        responseReturn.ResponseSend(res, true, 200, author)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})
router.delete('/:id', async function (req, res, next) {
    try {
        let author = await authorModel.findByIdAndUpdate(req.params.id, {
            isDelete: true
        }, {
            new: true
        });
        responseReturn.ResponseSend(res, true, 200, author)
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

module.exports = router;
