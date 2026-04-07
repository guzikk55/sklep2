require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cart = req.session.cart || [];
    next();
});

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const sellerRoutes = require('./routes/seller');

app.use('/auth', authRoutes);
app.use('/client', clientRoutes);
app.use('/seller', sellerRoutes);

app.get('/', (req, res) => res.redirect('/client/products'));

app.listen(process.env.PORT, () => console.log(`Server: http://localhost:${process.env.PORT}`));