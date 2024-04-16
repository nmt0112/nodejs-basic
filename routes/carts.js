const express = require('express');
const router = express.Router();
const Cart = require('../schemas/cart');
const protect = require('../middleware/protect');
var responseReturn = require('../helper/ResponseHandle');

router.get('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này.' });
        }
        const cartWithTotalPrice = {
            ...cart.toObject(),
            totalPrice: cart.totalPrice
        };
        responseReturn.ResponseSend(res, true, 200, cartWithTotalPrice);
    } catch (error) {
        responseReturn.ResponseSend(res, false, 404, error);
    }
});

router.post('/add', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, products: [] });
        }
        const existingProductIndex = cart.products.findIndex(item => item.product.toString() === req.body.productId);
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += 1;
        } else {
            cart.products.push({ product: req.body.productId, quantity: 1 });
        }
        await cart.save();
        responseReturn.ResponseSend(res, true, 200, cart);
    } catch (error) {
        console.log(error);
        responseReturn.ResponseSend(res, false, 404, error);
    }
});

router.post('/update', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này.' });
        }
        const existingProduct = cart.products.find(item => item.product.toString() === productId);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
        }
        existingProduct.quantity = quantity;
        await cart.save();
        responseReturn.ResponseSend(res, true, 200, cart);
    } catch (error) {
        console.error('Error updating cart:', error);
        responseReturn.ResponseSend(res, false, 404, error);
    }
});

router.post('/remove', protect, async (req, res) => {
    try {
        const { productId } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng cho người dùng này.' });
        }
        cart.products = cart.products.filter(item => item.product.toString() !== productId);
        await cart.save();
        responseReturn.ResponseSend(res, true, 200, cart);
    } catch (error) {
        console.error('Error removing product from cart:', error);
        responseReturn.ResponseSend(res, false, 404, error);
    }
});

module.exports = router;
