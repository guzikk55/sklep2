const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { isLoggedIn, hasRole } = require('../middleware/auth');

router.get('/products', async (req, res) => {
    let filter = {};
    if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
    if (req.query.category) filter.category = req.query.category;
    let sort = req.query.sort === 'desc' ? { price: -1 } : { price: 1 };
    const products = await Product.find(filter).sort(sort);
    res.render('client/dashboard', { products });
});

router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.redirect('/client/products');

        let hasReviewed = false;
        if (req.session.user) {
            hasReviewed = product.reviews.some(r => r.userId && r.userId.toString() === req.session.user.id);
        }

        res.render('client/product', { product, hasReviewed });
    } catch (err) {
        res.redirect('/client/products');
    }
});

router.post('/cart/add/:id', isLoggedIn, hasRole('client'), (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    if (!req.session.cart.includes(req.params.id)) req.session.cart.push(req.params.id);
    res.redirect('/client/cart');
});

router.get('/cart', isLoggedIn, hasRole('client'), async (req, res) => {
    const products = await Product.find({ _id: { $in: req.session.cart || [] } });
    res.render('client/cart', { products });
});

router.post('/cart/remove/:index', isLoggedIn, hasRole('client'), (req, res) => {
    req.session.cart.splice(req.params.index, 1);
    res.redirect('/client/cart');
});

router.post('/order', isLoggedIn, hasRole('client'), async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) return res.redirect('/client/products');
    
    const products = await Product.find({ _id: { $in: req.session.cart } });
    const total = products.reduce((sum, p) => sum + p.price, 0);
    const productDetails = products.map(p => ({ name: p.name, price: p.price, seller: p.seller }));

    await Order.create({ client: req.session.user.id, productDetails, total });
    await Product.deleteMany({ _id: { $in: req.session.cart } });
    
    req.session.cart = [];
    res.redirect('/client/products');
});

router.post('/review/:id', isLoggedIn, hasRole('client'), async (req, res) => {
    const product = await Product.findById(req.params.id);
    const alreadyReviewed = product.reviews.some(r => r.userId && r.userId.toString() === req.session.user.id);
    
    if (!alreadyReviewed) {
        await Product.findByIdAndUpdate(req.params.id, {
            $push: { 
                reviews: { 
                    userId: req.session.user.id,
                    user: req.session.user.username, 
                    rating: req.body.rating, 
                    comment: req.body.comment 
                } 
            }
        });
    }
    res.redirect(`/client/product/${req.params.id}`);
});

module.exports = router;