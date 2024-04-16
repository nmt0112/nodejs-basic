var mongoose = require('mongoose');

var orderDetailsSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    quantity: Number,
    price: Number
}, { timestamps: true });

module.exports = mongoose.model('orderdetails', orderDetailsSchema);