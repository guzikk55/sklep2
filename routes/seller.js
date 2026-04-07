const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { isLoggedIn, hasRole } = require('../middleware/auth');

router.use(isLoggedIn, hasRole('seller'));

router.get('/dashboard', async (req, res) => {
    const products = await Product.find({ seller: req.session.user.id });
    res.render('seller/dashboard', { products });
});

router.get('/add', (req, res) => res.render('seller/add-product'));

router.post('/add', async (req, res) => {
    await Product.create({ ...req.body, seller: req.session.user.id });
    res.redirect('/seller/dashboard');
});

router.get('/edit/:id', async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.user.id });
    if (!product) return res.redirect('/seller/dashboard');
    res.render('seller/edit-product', { product });
});

router.put('/edit/:id', async (req, res) => {
    await Product.findOneAndUpdate({ _id: req.params.id, seller: req.session.user.id }, req.body);
    res.redirect('/seller/dashboard');
});

router.delete('/delete/:id', async (req, res) => {
    await Product.findOneAndDelete({ _id: req.params.id, seller: req.session.user.id });
    res.redirect('/seller/dashboard');
});

router.get('/orders', async (req, res) => {
    const allOrders = await Order.find().populate('client');
    const myOrders = allOrders.filter(order => 
        order.productDetails.some(p => p.seller.toString() === req.session.user.id)
    );
    res.render('seller/orders', { orders: myOrders });
});

module.exports = router;