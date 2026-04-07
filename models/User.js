const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'seller'], required: true },
    address: String
});
module.exports = mongoose.model('User', userSchema);