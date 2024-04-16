var express = require('express');
var router = express.Router();
var responseReturn = require('../helper/ResponseHandle');
var productModel = require('../schemas/product');
var brandModel = require('../schemas/brand');
var categoryModel = require('../schemas/category');
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/protect');
const multer = require('multer');
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
    var totalProducts = await productModel.countDocuments(queries);
    var products = await productModel
        .find(queries)
        .skip(limit * (page - 1))
        .sort(sort)
        .limit(limit)
        .exec();
    responseReturn.ResponseSend(res, true, 200, { products, totalProducts })
});

router.get('/:id', async function (req, res, next) {
    try {
        let product = await productModel.find({ _id: req.params.id });
        responseReturn.ResponseSend(res, true, 200, product)
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error)
    }
});

router.post('/', uploads, protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        var newproduct = new productModel({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.file.filename,
            brand: req.body.brand,
            category: req.body.category
        })
        await newproduct.save();

        var brand = await brandModel.findById(req.body.brand).populate("published").exec();
        brand.published.push(newproduct);
        await brand.save();

        var category = await categoryModel.findById(req.body.category).populate("published").exec();
        category.published.push(newproduct);
        await category.save();

        responseReturn.ResponseSend(res, true, 200, newproduct)
    } catch (error) {
        console.log(error);
        responseReturn.ResponseSend(res, true, 404, error)
    }
})
router.put('/:id', uploads, protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let updateData = { ...req.body };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        let product = await productModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

        responseReturn.ResponseSend(res, true, 200, product);
    } catch (error) {
        responseReturn.ResponseSend(res, true, 404, error);
    }
});
// router.put('/:id', async function (req, res, next) {
//     try {
//         let product = await productModel.findByIdAndUpdate(req.params.id, req.body,
//             {
//                 new: true
//             });
//         responseReturn.ResponseSend(res, true, 200, product)
//     } catch (error) {
//         responseReturn.ResponseSend(res, true, 404, error)
//     }
// })

router.delete('/:id', protect, checkRole("modifier", "admin"), async function (req, res, next) {
    try {
        let product = await productModel.findById(req.params.id);
        if (!product) {
            return responseReturn.ResponseSend(res, false, 404, 'Brand not found');
        }
        product.isDelete = !product.isDelete;
        await product.save();
        responseReturn.ResponseSend(res, true, 200, product);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error.message);
    }
})

module.exports = router;
