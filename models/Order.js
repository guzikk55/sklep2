const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productDetails: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', orderSchema);