const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        enum: ['pending', 'confirm'],
        default: 'pending'
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orderdetails'
    }]
}, { timestamps: true });

// Tạo một virtual để tính tổng tiền từ các order details
orderSchema.virtual('totalPrice').get(function () {
    let totalPrice = 0;
    this.items.forEach(item => {
        totalPrice += item.price * item.quantity;
    });
    return totalPrice;
});

module.exports = mongoose.model('order', orderSchema);
