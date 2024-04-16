const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const Order = require('../schemas/order');
const OrderDetails = require('../schemas/orderdetails');
const protect = require('../middleware/protect');
const responseReturn = require('../helper/ResponseHandle');
const checkRole = require('../middleware/checkRole');

router.get('/all', protect, checkRole("modifier", "admin"), async (req, res) => {
    try {
        const orders = await Order.find().populate('items');
        const numberOfOrders = orders.length;
        responseReturn.ResponseSend(res, true, 200, { numberOfOrders, orders });
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error);
    }
});

router.post('/checkout', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này.' });
        }
        const order = new Order({ user: req.user._id });
        for (const item of cart.products) {
            const orderDetail = new OrderDetails({
                order: order._id,
                product: item.product._id,
                quantity: item.product.quantity,
                quantity: item.quantity,
                price: item.product.price
            });
            await orderDetail.save();
            order.items.push(orderDetail._id);
        }
        await order.save();
        await Cart.deleteOne({ _id: cart._id });
        responseReturn.ResponseSend(res, true, 200, order);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error);
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items');

        const ordersWithTotalPrice = orders.map(order => {
            let totalPrice = 0;
            order.items.forEach(item => {
                totalPrice += item.price * item.quantity;
            });
            return {
                ...order.toObject(),
                totalPrice: totalPrice
            };
        });

        responseReturn.ResponseSend(res, true, 200, ordersWithTotalPrice);
    } catch (error) {
        console.log(error);
        responseReturn.ResponseSend(res, false, 500, error);
    }
});

router.get('/:orderId', protect, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const orderDetails = await OrderDetails.find({ order: orderId });
        if (!orderDetails) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng.' });
        }
        responseReturn.ResponseSend(res, true, 200, orderDetails);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error);
    }
});

router.post('/confirm/:orderId', protect, checkRole("modifier", "admin"), async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }
        if (order.status === 'confirm') {
            return res.status(400).json({ message: 'Đơn hàng đã được xác nhận trước đó.' });
        }
        order.status = 'confirm';
        await order.save();
        responseReturn.ResponseSend(res, true, 200, order);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 500, error);
    }
});

module.exports = router;
