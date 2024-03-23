var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    price: Number,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'author'
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = new mongoose.model('book', bookSchema)