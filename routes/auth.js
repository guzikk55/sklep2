const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/register', (req, res) => res.render('auth/register'));
router.post('/register', async (req, res) => {
    const { username, password, role, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword, role, address });
    res.redirect('/auth/login');
});

router.get('/login', (req, res) => res.render('auth/login'));
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { id: user._id, username: user.username, role: user.role };
        return res.redirect(user.role === 'seller' ? '/seller/dashboard' : '/client/products');
    }
    res.redirect('/auth/login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;