const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        user: String,
        rating: Number,
        comment: String
    }]
});
module.exports = mongoose.model('Product', productSchema);