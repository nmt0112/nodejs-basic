var mongoose = require('mongoose');

var authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

authorSchema.virtual('published', {
    ref: 'book',
    foreignField: 'author',
    localField: '_id'
})

authorSchema.set('toObject', { virtuals: true })
authorSchema.set('toJSON', { virtuals: true })

module.exports = new mongoose.model('author', authorSchema)
