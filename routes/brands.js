var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var brandModel = require('../schemas/brand');
const multer = require('multer');
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/protect');

var storage = multer.diskStorage({
    destination: function (res, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + file.originalname);
    },
});

var uploads = multer({
    storage: storage,
}).single("image");

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
    var totalBrands = await brandModel.countDocuments(queries);
    var brands = await brandModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .populate('published')
        .exec();
    responseReturn.ResponseSend(res, true, 200, { brands, totalBrands })
});

router.post('/', uploads, protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        var newbrand = new brandModel({
            name: req.body.name,
            image: req.file.filename,
        });
        await newbrand.save();
        responseReturn.ResponseSend(res, true, 200, newbrand)
    } catch (error) {
        console.log(error);
        responseReturn.ResponseSend(res, true, 404, error)
    }
})

router.get('/:id', async function (req, res, next) {
    try {
        let brand = await brandModel.find({ _id: req.params.id });
        responseReturn.ResponseSend(res, true, 200, brand)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.put('/:id', uploads, protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        let brand = await brandModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

        responseReturn.ResponseSend(res, true, 200, brand);
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error);
    }
});

router.delete('/:id', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let brand = await brandModel.findById(req.params.id);
        if (!brand) {
            return responseReturn.ResponseSend(res, false, 404, 'Brand not found');
        }
        brand.isDelete = !brand.isDelete;
        await brand.save();
        responseReturn.ResponseSend(res, true, 200, brand);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error.message);
    }
})


module.exports = router;
