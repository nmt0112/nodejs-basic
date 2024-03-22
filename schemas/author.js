var mongoose = require('mongoose');

var authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    published: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book'
    }],
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = new mongoose.model('author', authorSchema)