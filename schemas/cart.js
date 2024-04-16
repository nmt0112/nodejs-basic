var mongoose = require('mongoose');

var cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
}, { timestamps: true });

cartSchema.virtual('totalPrice').get(function () {
    let totalPrice = 0;
    this.products.forEach(item => {
        totalPrice += item.product.price * item.quantity;
    });
    return totalPrice;
});

module.exports = mongoose.model('cart', cartSchema);
